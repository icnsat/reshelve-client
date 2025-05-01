import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Container, Row, Col, Image, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';


import api from '../api/api';


const BookDetailsPage = () => {
    const { bookId } = useParams();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    const [book, setBook] = useState(null);
    const [bookshelfId, setBookshelfId] = useState(null);
    const [bookshelfTags, setBookshelfTags] = useState([]);

    const [systemTags, setSystemTags] = useState([]);

    const [allTags, setAllTags] = useState([]);
    
    const [userTags, setUserTags] = useState([]); // для пользовательских тегов
    const [newTagName, setNewTagName] = useState(''); // для ввода нового тега

    const [added, setAdded] = useState(false);

    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [editingTagId, setEditingTagId] = useState(null);
    const [editedTagName, setEditedTagName] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);  
    

    const [error, setError] = useState(null);

    const fetchBook = useCallback(async () => {
        if (!isAuthenticated) {
            try {
                const response = await api.get(`/books/${bookId}`);
                setBook(response.data[0]);
            } catch (err) {
                setError('Не удалось загрузить книгу');
            }
        } else {
            try {
                const response = await api.get(`/books/${bookId}/details`);
                setBook(response.data.book);
                setBookshelfId(response.data.bookshelfId || null);
                setBookshelfTags(response.data.bookshelfTags?.map(tag => tag.id) || []);
                setUserTags(response.data.userTags || []); // загрузка чисто пользовательских тегов
                setSystemTags(response.data.systemTags || [])
                setAllTags(response.data.allTags || []);
                setAdded(!!response.data.bookshelfId);
            } catch (err) {
                setError('Не удалось загрузить книгу');
            }
        }
    }, [bookId, isAuthenticated]);

    useEffect(() => {
        fetchBook();
    }, [ fetchBook]);

    
    const handleAddToBookshelf = async () => {
        setAdding(true);
        try {
            await api.post('/bookshelf', { book_id: book.id });
            setAdded(true);
            fetchBook();
        } catch (err) {
            setError('Не удалось добавить книгу');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteFromBookshelf = async () => {
        setDeleting(true);
        try {
            await api.delete(`/bookshelf/${bookshelfId}`);
            fetchBook();
        } catch (err) {
            setError('Не удалось удалить книгу');
        } finally {
            setDeleting(false);
        }
    };

    const toggleTag = async (tagId) => {
        const updatedTags = bookshelfTags.includes(tagId)
            ? bookshelfTags.filter(id => id !== tagId)
            : [...bookshelfTags, tagId];
    
        try {
            setBookshelfTags(updatedTags);
            await api.post(`/bookshelf/${bookshelfId}/tags`, {
                tagIds: updatedTags
            });
        } catch (err) {
            setError('Не удалось обновить теги');
        }
    };
    
    const handleAddNewTag = async () => {
        if (newTagName.trim() === '') {
            return;
        }
        try {
            const response = await api.post('/tags', { name: newTagName });
            setUserTags([...userTags, { id: response.data.id, name: newTagName }]);
            setNewTagName('');
            fetchBook();
        } catch (err) {
            setError('Не удалось создать тег');
        }
    };


    const handleStartEditing = (tag) => {
        setEditingTagId(tag.id);
        setEditedTagName(tag.name);
    };

    const handleSaveEdit = async (tagId) => {
        if (!editedTagName.trim()) {
          alert('Название тега не может быть пустым');
          return;
        }
      
        try {
            await api.put(`/tags/${editingTagId}`, {
                name: editedTagName.trim()
            });
            
            // Обновляем UI
            setUserTags(prev => prev.map(tag => 
                tag.id === tagId ? { ...tag, name: editedTagName.trim() } : tag
            ));
            
            setEditingTagId(null);
            fetchBook();
        } catch (error) {
            console.error('Ошибка при обновлении тега:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingTagId(null);
    };



    const handleDeleteTag = async (tagId) => {
        try {
            await api.delete(`/tags/${tagId}`);
            setUserTags(userTags.filter(tag => tag.id !== tagId)); // удаляем тег из списка
            fetchBook();
        } catch (err) {
            setError('Не удалось удалить тег');
        }
    };


    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!book) {
        return <Spinner animation="border"/>;
    }

    return (
        <Container className="my-5">
            <Row>
                <Col md={4} className="d-flex justify-content-center align-items-start">
                    <Image
                        src={`${api.defaults.baseURL}/media/${book.cover_url}`}
                        alt={book.title}
                        fluid
                        style={{ height: '30rem', objectFit: 'cover' }}
                    />
                </Col>
                <Col md={8}>
                    <h2>{book.title}</h2>
                    <p><strong>Автор:</strong> {book.author}</p>
                    <p><strong>Жанр:</strong> {book.genre}</p>
                    <p><strong>Год публикации:</strong> {book.published_year}</p>
                    <p>{book.description}</p>

                    {isAuthenticated ? (
                        <>
                            {added ? (
                                <Button onClick={() => setShowDeleteModal(true)} disabled={deleting} variant='danger'>
                                    {deleting ? 'Удаление...' : 'Удалить из аккаунта'}
                                </Button>
                                ) : (
                                <Button onClick={handleAddToBookshelf} disabled={adding}>
                                    {adding ? 'Добавление...' : 'Добавить в мой аккаунт'}
                                </Button>
                            )}

                            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Подтверждение удаления</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Вы точно хотите удалить эту книгу из своей полки?
                                    Вместе с ней удалятся комментарии и логи.</Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Отмена</Button>
                                    <Button variant="danger" onClick={handleDeleteFromBookshelf}>Удалить</Button>
                                </Modal.Footer>
                            </Modal>

                            {bookshelfId && (
                                <>
                                <div className="mt-4">
                                    <h5>Базовые теги:</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {/* {allTags.map(tag => ( */}
                                        {systemTags.map(tag => (
                                            <Button
                                                key={tag.id}
                                                variant={bookshelfTags.includes(tag.id) ? 'primary' : 'outline-secondary'}
                                                size="sm"
                                                onClick={() => toggleTag(tag.id)}
                                            >
                                                {tag.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h5>Добавить новый тег:</h5>
                                    <Form.Control
                                        type="text"
                                        placeholder="Введите название тега"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                    />
                                    <Button
                                        variant="success"
                                        onClick={handleAddNewTag}
                                        disabled={!newTagName}
                                        className="mt-2"
                                    >
                                        Добавить тег +
                                    </Button>
                                </div>

                                <div className="mt-4">
                                    <h5>Мои теги:</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {userTags.map(tag => (
                                            <div key={tag.id} className="d-flex align-items-center mb-2">
                                                {editingTagId === tag.id ? (
                                                    <div className="d-flex align-items-center">
                                                        <Form.Control
                                                            type="text"
                                                            value={editedTagName}
                                                            onChange={(e) => setEditedTagName(e.target.value)}
                                                            size="sm"
                                                            autoFocus
                                                            className="me-2"
                                                            style={{ width: '150px' }}
                                                        />
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleSaveEdit(tag.id)}
                                                        >
                                                            ✓
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div> 
                                                ) : (
                                                    <div className="d-flex align-items-center">
                                                        <Button
                                                            variant={bookshelfTags.includes(tag.id) ? 'primary' : 'outline-secondary'}
                                                            size="sm"
                                                            onClick={() => toggleTag(tag.id)}
                                                            className="me-2"
                                                        >
                                                            {tag.name}
                                                        </Button>
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleStartEditing(tag)}
                                                            title="Редактировать"
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteTag(tag.id)}
                                                            title="Удалить"
                                                        >
                                                            <Trash size={14} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                </>
                            )}
                        </>
                    ) : (
                        <Alert variant="info" className="mt-4">
                            Войдите в аккаунт, чтобы управлять книгами
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default BookDetailsPage;
