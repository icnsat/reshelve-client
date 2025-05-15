import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, InputGroup, Stack, Badge, Spinner, Alert } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import api from '../api/api';

const BookshelfPage = () => {
    const [books, setBooks] = useState([]);
    const [tags, setTags] = useState([]);

    const [selectedTags, setSelectedTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const fetchBooks = async () => {
        try {
            const booksResponse = await api.get(`/bookshelf`);
            setBooks(booksResponse.data);

            console.log(booksResponse.data);
        } catch (err) {
            setError('Ошибка при загрузке книг');
        }
    };

    const fetchTags = async () => {
        try {
            const tagsResponse = await api.get('/tags');
            setTags(tagsResponse.data.allTags);
            console.log(tagsResponse.data);
        } catch (err) {
            console.error('Ошибка при загрузке тегов');
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        fetchTags();
    }, []);

    const handleTagToggle = (tagId) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    const handleCardClick = (bookshelfId) => {
        navigate(`/bookshelf/${bookshelfId}`);
    };

    const filteredBooks = books.filter((book) => {
        // console.log(books);
        const matchesSearch = 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
        const matchesTags = selectedTags.length === 0 || 
            selectedTags.some(tagId => book.tag_ids?.includes(tagId));
        
        return matchesSearch && matchesTags;
    });

    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!books) return <Spinner animation="border" />;

    return (
        <>
            <Row className='my-3'>
                <Form.Group as={Col}>
                    <InputGroup>
                        <InputGroup.Text><Search /></InputGroup.Text>
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

            <Row className='mb-4'>
                {tags.length === 0 ? (
                    <Col>
                        <div className="text-center py-5">
                            <h2>Теги не найдены</h2>
                            <p className="text-muted">Добавьте тег для какой-либо книги</p>
                        </div>
                    </Col>
                ) : (
                    <Col>
                        {/* <h5>Фильтр по тегам:</h5> */}
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                            {tags.map(tag => (
                                <Button
                                    key={tag.id}
                                    variant={selectedTags.includes(tag.id) ? 'primary' : 'outline-secondary'}
                                    size="sm"
                                    onClick={() => handleTagToggle(tag.id)}
                                >
                                    {tag.name}
                                </Button>
                            ))}
                        </Stack>
                    </Col>
                )}

                
            </Row>

            <hr />

            <Row>
                {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                        <Col key={book.bookshelf_id} sm={6} lg={3} className='mb-4'>
                            <Card onClick={() => handleCardClick(book.bookshelf_id)} style={{ 
                                height: "100%",
                                flexDirection: "column",
                                cursor: 'pointer'
                            }}>
                                <Card.Img
                                    variant="top"
                                    src={`${api.defaults.baseURL}/media/${book.cover_url}`}
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
                                    <div>
                                        {book.tag_ids?.map(id => {
                                            const tag = tags.find(t => t.id === id);
                                            return tag ? <Badge key={id} bg="info" className="me-1">{tag.name}</Badge> : null;
                                        })}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <div className="text-center py-5">
                        <h2>Книги не найдены</h2>
                        <p className="text-muted">Попробуйте изменить параметры поиска</p>
                    </div>
                )}
            </Row>
        </>
    );
};

export default BookshelfPage;
