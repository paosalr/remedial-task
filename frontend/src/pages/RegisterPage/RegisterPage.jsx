import React, { useState } from 'react';
import { register } from '../../api/Auth';
import { Input, Button, Form, notification, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await register(values);
      notification.success({ message: 'Registro Exitoso!' });
      form.resetFields();
    } catch (error) {
      notification.error({ message: 'Registro fallido', description: error.response?.data?.message });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Register</h1>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="Ingresa tu email" />
        </Form.Item>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input placeholder="Ingresa tu usuario" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password placeholder="Ingresa tu contraseña" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Typography.Text>¿Ya tienes cuenta? </Typography.Text>
        <Button 
          type="link" 
          style={{ padding: '0', color: '#4F2A42', fontWeight: 'bold' }} 
          onClick={() => navigate('/login')}
        >
          Inicia sesión
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;
