import React, { useState } from "react";
import { Button, Container, Card, Form, Alert, Nav } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { login } from "../slices/authSlice";
import api from '../api/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post(
                'auth/login/',
                { email, password }
            );
            if (response.status >= 200 && response.status < 300) {
                const { token: token } = response.data;
                console.log(response.data);
                dispatch(login({ token }))
                navigate('/');
            } else {
                setError('Недействительные учетные данные.');
            }
        } catch (err) {
            setError('Возникла ошибка при отправке запроса.');
        }
    };

    return (
        <Container className="col-lg-6 my-4">
            <Card className="p-4">
                <Card.Title className="text-center">Вход</Card.Title>
                <Card.Body>
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Почта</Form.Label>
                            <Form.Control 
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control 
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="outline-primary" type="submit">Войти</Button>
                        <Nav.Link as={Link} to="/registration" className="text-center text-primary">
                            Ещё нет аккаунта?
                        </Nav.Link>                    
                    </Form> 
                </Card.Body>
            </Card>
            {error && <Alert variant="danger" className="my-4">{error}</Alert>}
        </Container>
    );
}; 

export default Login;