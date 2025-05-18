import { Container, Row, Col} from 'react-bootstrap';


function HomePage() {
    return (
        <Container className="mt-5">
            <br /> <br />
            <Row className="text-center mb-5">
                <Col>
                    <h1>Добро пожаловать в Reshelve - виртуальную книжную полку!</h1>
                    <p className="lead">Ищите и расставляйте книги по полкам, отслеживайте прогресс чтения, храните заметки о прочитанном — всё в одном месте.</p>
                </Col>
            </Row>

            <Row className="mt-5 text-center">
            <Col md={4}>
                <h5>📚 Добавляйте книги</h5>
                <p>Соберите свою личную полку с любимыми изданиями</p>
            </Col>
            <Col md={4}>
                <h5>📝 Ведите заметки</h5>
                <p>Пишите комментарии, отслеживайте прогресс чтения</p>
            </Col>
            <Col md={4}>
                <h5>🏷️ Используйте теги</h5>
                <p>Организуйте книги по жанрам и темам</p>
            </Col>
            </Row>
            </Container>
    );
}

export default HomePage;