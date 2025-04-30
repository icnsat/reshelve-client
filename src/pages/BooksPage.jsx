import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, Button, Form, Row, Col, InputGroup, Stack } from 'react-bootstrap';
import { Pencil, Search, Person, List, Quote } from 'react-bootstrap-icons';

import api from '../api/api';


const BooksPage = () => {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/books');
                setBooks(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке списка книг:', error);
            }
        };
        fetchBooks();
    }, []);
    
    const filteredBooks = books.filter((book) => {
        return book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleCardClick = (bookId) => {
        navigate(`/books/${bookId}`);
    };

    return (
        <>
            <Row className='my-4'>
                <Form.Group as={Col}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search></Search>
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Название или автор"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Form.Group>
            </Row>

            
            <hr />

            <Row className='my-4'>
                {filteredBooks.map((book) => (
                    <Col key={book.id} sm={6} lg={3} className='mb-4'>
                        <Card style={{
                            height: "100%",
                            flexDirection: "column"
                        }} onClick={() => handleCardClick(book.id)}>
                        <Card.Img
                            variant="top"
                            src={`${api.defaults.baseURL}/media/${book.cover_url}`}
                            alt={book.title}
                            style={{
                                height: "26rem",
                                objectFit: "cover",
                                objectPosition: "center"
                            }}
                        />
                        <Card.Body className="text-center" style={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center"
                        }}>
                            <Card.Title>{book.title}</Card.Title>
                            <Card.Text>{book.author}</Card.Text>
                        </Card.Body>
                        </Card>
                    </Col>
                    ))}
            </Row>
        </>
    );
};

export default BooksPage;