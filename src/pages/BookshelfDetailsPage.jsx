import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Container, Row, Col, Image, Spinner, Alert, Modal, Form, Card} from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import api from '../api/api';

const BookshelfDetailsPage = () => {
    const { bookshelfId } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [comments, setComments] = useState([]);
    const [readingLogs, setReadingLogs] = useState([]);
    const [bookshelfTags, setBookshelfTags] = useState([]);
    const [userTags, setUserTags] = useState([]);
    const [systemTags, setSystemTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
  
    const [newTagName, setNewTagName] = useState('');
    const [editingTagId, setEditingTagId] = useState(null);
    const [editedTagName, setEditedTagName] = useState('');

    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');

    const [newLog, setNewLog] = useState({
        start_page: '',
        end_page: '',
        duration_minutes: '',
        date: '' });
    const [editingLogId, setEditingLogId] = useState(null);
    const [editingLogData, setEditingLogData] = useState({});

    const [error, setError] = useState(null);
  
    const [showDeleteModal, setShowDeleteModal] = useState(false);  

    const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
    const [commentToDeleteId, setCommentToDeleteId] = useState(null);

    const [showDeleteLogModal, setShowDeleteLogModal] = useState(false);
    const [logToDeleteId, setLogToDeleteId] = useState(null);

    const fetchBook = useCallback(async () => {
        try {
            const response = await api.get(`/bookshelf/${bookshelfId}`);
            setBook(response.data);
            setComments(response.data.comments || [])
            setReadingLogs(response.data.readingLogs || [])
            setBookshelfTags(response.data.bookshelfTags?.map(tag => tag.id) || []);
            setUserTags(response.data.userTags || []);
            setSystemTags(response.data.systemTags || []);
            setAllTags(response.data.allTags || []);

            console.log(response.data);
        } catch (err) {
            setError('Не удалось загрузить данные');
        }
    }, [bookshelfId]);

    useEffect(() => {
        fetchBook();
    }, [bookshelfId, fetchBook]);

    const handleDeleteFromBookshelf = async () => {
        try {
            await api.delete(`/bookshelf/${bookshelfId}`);
            navigate('/bookshelf');
        } catch {
            setError('Не удалось удалить книгу');
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
        } catch {
            setError('Ошибка при обновлении тегов');
        }
    };


    const handleAddNewTag = async () => {
        if (newTagName.trim() === '') {
            return;
        }
        try {
            const response = await api.post('/tags', {
                name: newTagName
            });
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


    // === Комментарии ===
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        await api.post(`/bookshelf/${bookshelfId}/comments`, {
            content: newComment
        });
        setNewComment('');
        fetchBook();
    };

    const handleEditComment = async () => {
        if (!editingCommentContent.trim()) return;
        await api.patch(`/bookshelf/${bookshelfId}/comments/${editingCommentId}`, {
            content: editingCommentContent
        });
        setEditingCommentId(null);
        fetchBook();
    };

    const confirmDeleteComment = (id) => {
        setCommentToDeleteId(id);
        setShowDeleteCommentModal(true);
    };
    
    const handleDeleteComment = async () => {
        try{
            await api.delete(`/bookshelf/${bookshelfId}/comments/${commentToDeleteId}`);
            setShowDeleteCommentModal(false);
            setCommentToDeleteId(null);
            fetchBook();
        } catch (err) {
            setError('Не удалось удалить заметку');
        }
    };


    const handleAddLog = async () => {
        const { start_page, end_page, duration_minutes, date } = newLog;
        if (!start_page || !end_page || !duration_minutes || !date) return;

        await api.post(`/bookshelf/${bookshelfId}/logs`, {
            start_page: Number(start_page),
            end_page: Number(end_page),
            duration_minutes: Number(duration_minutes),
            date,
        });
        setNewLog({ start_page: '', end_page: '', duration_minutes: '', date: '' });
        fetchBook();
    };

    const handleEditLog = async () => {
        const { start_page, end_page, duration_minutes, date } = editingLogData;
        await api.put(`/bookshelf/${bookshelfId}/logs/${editingLogId}`, {
            start_page: Number(start_page),
            end_page: Number(end_page),
            duration_minutes: Number(duration_minutes),
            date,
        });
        setEditingLogId(null);
        fetchBook();
    };
    
    const confirmDeleteLog = (id) => {
        setLogToDeleteId(id);
        setShowDeleteLogModal(true);
    };

    const handleDeleteLog = async () => {
        try {
            await api.delete(`/bookshelf/${bookshelfId}/logs/${logToDeleteId}`);
            setShowDeleteLogModal(false);
            setLogToDeleteId(null);
            fetchBook();
        } catch (err) {
            setError('Не удалось удалить лог чтения');
        }
    };


    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!book) return <Spinner animation="border" />;

    return (
        <Container className="my-5">
            <Row>
                <Col md={4}>
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
                    <p><strong>Год:</strong> {book.published_year}</p>
                    <p>{book.description}</p>

                    <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                        className="mb-4"
                    >
                        Удалить книгу
                    </Button>

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

                    <hr />

                    <h4 className="mt-5">Теги</h4>
                    <div className="d-flex flex-wrap gap-2">
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

                    <div className="mt-4 d-flex align-items-center gap-2" style={{ maxWidth: '300px' }}>
                        <Button
                            variant="success"
                            onClick={handleAddNewTag}
                            disabled={!newTagName}
                            size="sm"
                        >
                            +
                        </Button>
                        <Form.Control
                            type="text"
                            placeholder="Добавить новый тег"
                            className="flex-grow-1"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                        />
                    </div>



                    <div className="mt-4">
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

                    <hr className="mt-5" />

                    <h4 className="mt-5">Заметки</h4>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Новая заметка"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button className="mt-2 mb-3" onClick={handleAddComment}>Добавить заметку</Button>

                    {comments.map(comment => (
                        <Card key={comment.id} className="mb-2">
                            <Card.Body>
                                {editingCommentId === comment.id ? (
                                    <>
                                        <Form.Control
                                            as="textarea"
                                            value={editingCommentContent}
                                            onChange={(e) => setEditingCommentContent(e.target.value)}
                                        />
                                        <Button
                                            size="sm"
                                            className="mt-2 me-2"
                                            variant="success"
                                            onClick={handleEditComment}
                                        >
                                            ✓
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="mt-2"
                                            variant="secondary"
                                            onClick={() => setEditingCommentId(null)}
                                        >
                                            ✕
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p>{comment.content}</p>
                                        <div className="d-flex align-items-center gap-3">
                                            <small className="text-muted">Создано: {new Date(comment.created_at).toLocaleDateString()}</small>
                                            <div style={{height: '1rem', width: 0, borderLeft: '1px solid'}} className="text-muted" />
                                            <small className="text-muted">Отредактировано: {new Date(comment.updated_at).toLocaleDateString()}</small>
                                            <div className="ms-auto">
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    className="me-2"
                                                    title="Редактировать"
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditingCommentContent(comment.content);
                                                    }}
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="me-2"
                                                    title="Удалить"
                                                    onClick={() => confirmDeleteComment(comment.id)}
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    ))}

                    <hr className="mt-5" />

                    <h4 className="mt-5">Логи чтения</h4>
                    <Row className="g-2">
                        <Col><Form.Control type="number" min="0" placeholder="Со страницы" value={newLog.start_page} onChange={(e) => setNewLog(prev => ({ ...prev, start_page: e.target.value }))} /></Col>
                        <Col><Form.Control type="number" min="0" placeholder="До страницы" value={newLog.end_page} onChange={(e) => setNewLog(prev => ({ ...prev, end_page: e.target.value }))} /></Col>
                        <Col><Form.Control type="number" min="0" placeholder="Минут" value={newLog.duration_minutes} onChange={(e) => setNewLog(prev => ({ ...prev, duration_minutes: e.target.value }))} /></Col>
                        <Col><Form.Control type="date" value={newLog.date} onChange={(e) => setNewLog(prev => ({ ...prev, date: e.target.value }))} /></Col>
                        <Col><Button onClick={handleAddLog}>Добавить</Button></Col>
                    </Row>

                    <div className="mt-3">
                        {readingLogs.map(log => (
                            <Card key={log.id} className="mb-2">
                                <Card.Body>
                                    {editingLogId === log.id ? (
                                        <Row className="g-2">
                                            <Col><Form.Control type="number" min="0" value={editingLogData.start_page} onChange={
                                                (e) => setEditingLogData(prev => ({ ...prev, start_page: e.target.value }))
                                            }/></Col>
                                            <Col><Form.Control type="number" min="0" value={editingLogData.end_page} onChange={(e) => setEditingLogData(prev => ({ ...prev, end_page: e.target.value }))} /></Col>
                                            <Col><Form.Control type="number" min="0" value={editingLogData.duration_minutes} onChange={(e) => setEditingLogData(prev => ({ ...prev, duration_minutes: e.target.value }))} /></Col>
                                            <Col><Form.Control type="date" value={editingLogData.date} onChange={(e) => setEditingLogData(prev => ({ ...prev, date: e.target.value }))} /></Col>
                                            <Col>
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    className="mt-1"
                                                    onClick={handleEditLog}
                                                >
                                                    ✓
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="mt-1 ms-2"
                                                    onClick={() => setEditingLogId(null)}
                                                >
                                                    ✕
                                                </Button>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{new Date(log.date).toLocaleDateString()}</strong>: {log.start_page} → {log.end_page} стр. за {log.duration_minutes} мин.
                                            </div>
                                            <div>
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    className="me-2"
                                                    titile="Редактировать"
                                                    onClick={() => {
                                                        setEditingLogId(log.id);
                                                        setEditingLogData(log);
                                                    }}
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="me-2"
                                                    title="Удалить"
                                                    onClick={() => confirmDeleteLog(log.id)}
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        ))}
                    </div> 

                    <Modal show={showDeleteCommentModal} onHide={() => setShowDeleteCommentModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Удаление заметки</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Вы уверены, что хотите удалить эту заметку?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteCommentModal(false)}>Отмена</Button>
                            <Button variant="danger" onClick={handleDeleteComment}>Удалить</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteLogModal} onHide={() => setShowDeleteLogModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Удаление лога чтения</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Вы уверены, что хотите удалить этот лог чтения?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteLogModal(false)}>Отмена</Button>
                            <Button variant="danger" onClick={handleDeleteLog}>Удалить</Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
};

export default BookshelfDetailsPage;
