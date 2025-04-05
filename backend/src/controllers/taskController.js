const db = require('../config/firebase');

const getTasks = async (req, res) => {
  try {
    const { userId, role } = req.user;

    let tasks = [];

    if (role === 'employee') {
      const individualTasksSnapshot = await db.collection('tasks')
        .where('userId', '==', userId)
        .where('taskType', '==', 'individual')
        .get();

      const groupTasksSnapshot = await db.collection('tasks')
        .where('taskType', '==', 'grupal')
        .get();

        const groupTasks = groupTasksSnapshot.docs
        .map((doc) => {
          const taskData = doc.data();
          const subtasks = taskData.subtasks || [];
          const isAssigned = subtasks.some(subtask => subtask.assignedTo === userId);
          return isAssigned ? { id: doc.id, ...taskData } : null;
        })
        .filter(task => task !== null);

      const individualTasks = individualTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      tasks = [...individualTasks, ...groupTasks];
    } else {
      const tasksSnapshot = await db.collection('tasks').get();
      tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    console.log("Tareas encontradas:", tasks); 
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

const { v4: uuidv4 } = require('uuid');

const createTask = async (req, res) => {
  try {
    const { name, description, groupId, status, category, taskType, subtasks } = req.body;
    const { userId, role } = req.user;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    if (taskType === 'grupal' && (role !== 'admin' && role !== 'master')) {
      return res.status(403).json({ error: 'No tienes permiso para crear tareas grupales' });
    }

    if (taskType === 'grupal' && (!subtasks || subtasks.length === 0)) {
      return res.status(400).json({ error: 'Debes asignar al menos una subtarea' });
    }

    const newTask = {
      name,
      description: description || '',
      userId,
      groupId: groupId || null,
      taskType: taskType || 'individual', 
      timeUntilFinish: new Date().toISOString(),
      status: status || 'En progreso',
      category: category || '',
      createdAt: new Date().toISOString(),
      subtasks: taskType === 'grupal' ? subtasks.map(subtask => ({ id: uuidv4(), ...subtask })) : [],
    };

    const taskRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ id: taskRef.id, ...newTask });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea', details: error.message });
  }
};

const updateTask = async (req, res) => {
  try {

    const { id } = req.params;
    const { userId, role } = req.user;
    const updatedData = req.body;

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const taskData = taskDoc.data();
    if (role === 'employee') {
      if (taskData.taskType === 'individual' && taskData.userId === userId) {
        const updateFields = {
          name: updatedData.name,
          description: updatedData.description,
          category: updatedData.category,
          status: updatedData.status,
          timeUntilFinish: updatedData.timeUntilFinish,
          lastUpdated: new Date().toISOString()
        };
        
        await taskRef.set(updateFields, { merge: true });
        
      } else if (taskData.taskType === 'grupal') {
        const isAssigned = taskData.subtasks.some((subtask) => subtask.assignedTo === userId);
        if (isAssigned) {
          const updatedSubtasks = taskData.subtasks.map((subtask) =>
            subtask.assignedTo === userId
              ? { ...subtask, status: updatedData.status }
              : subtask
          );
          await taskRef.update({ subtasks: updatedSubtasks });
        } else {
          return res.status(403).json({ error: 'No tienes permiso para editar esta tarea.' });
        }
      }
    } else if (role === 'admin' || role === 'master') {
      await taskRef.update(updatedData);
    } else {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tarea.' });
    }

    const updatedTask = await taskRef.get();
    
    res.status(200).json({ 
      message: 'Tarea actualizada correctamente',
      task: updatedTask.data()
    });
    
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ 
      error: 'Error al actualizar tarea',
      details: error.message 
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const taskData = taskDoc.data();

    if (taskData.userId !== userId && role !== 'admin' && role !== 'master') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea.' });
    }

    await taskRef.delete();
    res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

const updateSubtaskStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { subtaskId, newStatus } = req.body; 
    const { userId } = req.user; 

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const taskData = taskDoc.data();

    const subtaskIndex = taskData.subtasks.findIndex(st => st.id === subtaskId);    if (subtaskIndex === -1) {
      return res.status(404).json({ error: 'Subtarea no encontrada.' });
    }

    const subtask = taskData.subtasks[subtaskIndex];

    if (subtask.assignedTo !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta subtarea.' });
    }

    const updatedSubtasks = [...taskData.subtasks];
    updatedSubtasks[subtaskIndex].status = newStatus;

    await taskRef.update({ subtasks: updatedSubtasks });

    res.status(200).json({ message: 'Estado de la subtarea actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar la subtarea:', error);
    res.status(500).json({ error: 'Error al actualizar la subtarea' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, updateSubtaskStatus };
