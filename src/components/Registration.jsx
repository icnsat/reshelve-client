import React, { useState } from "react";
import { Button, Container, Card, Alert, Form, Nav } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

import api from '../api/api';

const Registration = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
    });
    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post(
                '/auth/register/',
                formData
            );
            if (response.status >= 200 && response.status < 300) {
                navigate('/login');
            } else {
                setError('Не удалось зарегистрироваться.');
            }
        } catch (err) {
            setError('Возникла ошибка при отправке запроса.');
        }
    };

    return (
        <Container className="col-lg-6 my-4">
            <Card className="p-4">
                <Card.Title className="text-center">Регистрация</Card.Title>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label>Почта</Form.Label>
                            <Form.Control 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Имя</Form.Label>
                            <Form.Control 
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        {/* <Form.Group className="mb-3">
                            <Form.Label>Повторите пароль</Form.Label>
                            <Form.Control 
                                type="password"
                                name="re_password"
                                value={formData.re_password}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group> */}

                        <Button  variant="outline-primary" type="submit">
                            Зарегистрироваться
                        </Button>
                        <Nav.Link as={Link} to="/login" className="text-center text-primary">
                            Уже есть аккаунт?
                        </Nav.Link>                    
                    </Form> 
                </Card.Body>
            </Card>
            {error && <Alert variant="danger" className="my-4">{error}</Alert>}
        </Container>
    );
}; 

export default Registration;