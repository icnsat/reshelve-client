import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner, Badge, Container } from 'react-bootstrap';
import api from '../api/api';

const AdminTagsPage = () => {
  const [tags, setTags] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentTag, setCurrentTag] = useState({ id: null, name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags'); 
      setTags(response.data.systemTags);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить теги');
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики модальных окон
  const handleShowCreateModal = () => {
    setCurrentTag({ id: null, name: '' });
    setModalType('create');
    setShowEditModal(true);
  };

  const handleShowEditModal = (tag) => {
    setCurrentTag(tag);
    setModalType('edit');
    setShowEditModal(true);
  };

  const handleShowDeleteModal = (tag) => {
    setCurrentTag(tag);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  // Обработчики действий
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/tags', { name: currentTag.name });
      } else {
        await api.put(`/tags/${currentTag.id}`, { name: currentTag.name });
      }
      fetchTags();
      handleCloseModals();
    } catch (err) {
      console.error('Error saving tag:', err);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/tags/${currentTag.id}`);
      fetchTags();
      handleCloseModals();
    } catch (err) {
      console.error('Error deleting tag:', err);
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
        <h1>Управление тегами</h1>
        <Button variant="primary" onClick={handleShowCreateModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Добавить тег
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Название</th>
            {/* <th>Тип</th> */}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td>{tag.id}</td>
              <td>{tag.name}</td>
              {/* <td>
                <Badge bg={tag.user_id ? 'info' : 'secondary'}>
                  {tag.user_id ? 'Пользовательский' : 'Системный'}
                </Badge>
              </td> */}
              <td>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowEditModal(tag)}
                >
                  <i className="bi bi-pencil-square"></i> Редактировать
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleShowDeleteModal(tag)}
                >
                  <i className="bi bi-trash"></i> Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Модальное окно для создания/редактирования */}
      <Modal show={showEditModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'create' ? 'Добавление тега' : 'Редактирование тега'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название тега</Form.Label>
              <Form.Control
                type="text"
                value={currentTag.name}
                onChange={(e) => setCurrentTag({...currentTag, name: e.target.value})}
                required
                maxLength={50}
                placeholder="Введите название тега"
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
          Вы уверены, что хотите удалить тег <strong>"{currentTag.name}"</strong>?
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

export default AdminTagsPage;