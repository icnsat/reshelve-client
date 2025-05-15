// import logo from './logo.svg';
// import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container } from 'react-bootstrap';

import { Provider } from 'react-redux';
import { store } from './app/store';

import Header from './components/Header';
import Registration from './components/Registration';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import BookshelfPage from './pages/BookshelfPage';
import BookshelfDetailsPage from './pages/BookshelfDetailsPage';
import AdminTagsPage from './pages/AdminTagsPage';
import AdminBooksPage from './pages/AdminBooksPage';


function App() {
    return (
        <Provider store={store}>
            <Container className="col-lg-10 mx-auto p-4 py-md-5">
                <BrowserRouter>
                    <Header />
                    <Routes>
                        <Route path="/" element={<HomePage />}></Route>
                        <Route path="/registration" element={<Registration />}></Route>
                        <Route path="/login" element={<Login />}></Route>
                        <Route path="/books" element={<BooksPage />}></Route>
                        <Route path="/books/:bookId" element={<BookDetailsPage />}></Route>


                        <Route path="/bookshelf" element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <BookshelfPage />
                            </ProtectedRoute>
                        }></Route>

                        <Route path="/bookshelf/:bookshelfId" element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <BookshelfDetailsPage />
                            </ProtectedRoute>
                        }></Route>


                        <Route path="/admin/tags" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminTagsPage />
                            </ProtectedRoute>
                        }></Route>

                        <Route path="/admin/books" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminBooksPage />
                            </ProtectedRoute>
                        }></Route>


                        {/*<Route path="/account" element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <Account />
                            </ProtectedRoute>
                        }></Route> */}

                    </Routes>
                </BrowserRouter>
            </Container>
        </Provider>
    );
}

export default App;
