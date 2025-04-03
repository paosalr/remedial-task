import React, { useState, useEffect } from "react";
import { Table, Select, message, Button } from "antd";
import axios from "axios";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ManageRoles = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get("https://remedial-task.onrender.com/api/users", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}`
        },
          });
          setUsers(response.data);
        } catch (error) {
          console.error("Error al cargar usuarios:", error);
          message.error("No se pudieron cargar los usuarios.");
        }
      };
  
      fetchUsers();
    }, []);
  
    const handleRoleChange = async (userId, newRole) => {
      try {
        await axios.post("https://remedial-task.onrender.com/api/auth/change-role", { userId, newRole }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        });
        message.success("Rol actualizado correctamente");
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      } catch (error) {
        console.error("Error al cambiar rol:", error);
        message.error("No se pudo cambiar el rol.");
      }
    };
  
    return (
      <div style={{ padding: "20px" }}>
        <h1 style={{ marginBottom: "20px", textAlign: 'center'}}>Gestionar Roles</h1>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Volver
        </Button>
        <Table 
          dataSource={users} 
          rowKey="id" 
          size="middle" 
          columns={[          
          { title: 'Nombre', dataIndex: 'username', key: 'username' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Rol Actual', dataIndex: 'role', key: 'role' },
          {  
            title: 'Cambiar Rol', 
              key: 'action', 
              width: 200,
              render: (_, record) => (
            <Select defaultValue={record.role} onChange={(value) => handleRoleChange(record.id, value)}
                    style={{width: "150px"}}>
              <Select.Option value="master">Master</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="employee">Employee</Select.Option>
            </Select>
          )},
        ]}
        pagination={{ pageSize: 10 }} 
        />
      </div>
    );
  };

  export default ManageRoles;