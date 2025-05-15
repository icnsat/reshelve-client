import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner, Container, Image } from 'react-bootstrap';
import api from '../api/api';

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentBook, setCurrentBook] = useState({
    id: null,
    title: '',
    author: '',
    genre: '',
    cover_url: '',
    description: '',
    published_year: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить книги');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики модальных окон
  const handleShowCreateModal = () => {
    setCurrentBook({
      id: null,
      title: '',
      author: '',
      genre: '',
      cover_url: '',
      description: '',
      published_year: ''
    });
    setModalType('create');
    setShowEditModal(true);
  };

  const handleShowEditModal = (book) => {
    setCurrentBook(book);
    setModalType('edit');
    setShowEditModal(true);
  };

  const handleShowDeleteModal = (book) => {
    setCurrentBook(book);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBook({ ...currentBook, [name]: value });
  };

  // Обработчики действий
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/books', currentBook);
      } else {
        await api.put(`/books/${currentBook.id}`, currentBook);
      }
      fetchBooks();
      handleCloseModals();
    } catch (err) {
      console.error('Error saving book:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      }
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/books/${currentBook.id}`);
      fetchBooks();
      handleCloseModals();
    } catch (err) {
      console.error('Error deleting book:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Управление книгами</h1>
        <Button variant="primary" onClick={handleShowCreateModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Добавить книгу
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Обложка</th>
            <th>Название</th>
            <th>Автор</th>
            <th>Жанр</th>
            <th>Год</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>
                {book.cover_url && (
                  <Image 
                    // src={book.cover_url} 
                    src={`${api.defaults.baseURL}/media/${book.cover_url}`}
                    alt={book.title} 
                    thumbnail 
                    style={{ maxWidth: '50px' }} 
                  />
                )}
              </td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.published_year}</td>
              <td>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowEditModal(book)}
                >
                  <i className="bi bi-pencil-square"></i> Редактировать
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleShowDeleteModal(book)}
                >
                  <i className="bi bi-trash"></i> Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Модальное окно для создания/редактирования */}
      <Modal show={showEditModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'create' ? 'Добавление книги' : 'Редактирование книги'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название*</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={currentBook.title}
                onChange={handleInputChange}
                required
                placeholder="Введите название книги"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Автор*</Form.Label>
              <Form.Control
                type="text"
                name="author"
                value={currentBook.author}
                onChange={handleInputChange}
                required
                placeholder="Введите автора"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Жанр*</Form.Label>
              <Form.Control
                type="text"
                name="genre"
                value={currentBook.genre}
                onChange={handleInputChange}
                required
                placeholder="Введите жанр"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL обложки</Form.Label>
              <Form.Control
                type="text"
                name="cover_url"
                value={currentBook.cover_url}
                onChange={handleInputChange}
                placeholder="Введите URL обложки"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Год издания</Form.Label>
              <Form.Control
                type="number"
                name="published_year"
                value={currentBook.published_year}
                onChange={handleInputChange}
                placeholder="Введите год издания"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentBook.description}
                onChange={handleInputChange}
                placeholder="Введите описание книги"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModals}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {modalType === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Модальное окно для удаления */}
      <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить книгу <strong>"{currentBook.title}"</strong>?
          <br />
          Это действие нельзя отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" />
                <span className="ms-2">Удаление...</span>
              </>
            ) : (
              'Удалить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminBooksPage;