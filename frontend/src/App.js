// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import VisitorList from './components/VisitorList';
import EditVisitor from './components/EditVisitor';
import DeleteVisitor from './components/DeleteVisitor';
import VisitorProfile from './components/VisitorProfile';


const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SignUp />} />
                <Route path="/visitors" element={<VisitorList />} />
                <Route path="/visitors/edit/:id" element={<EditVisitor />} />
                <Route path="/visitors/delete/:id" element={<DeleteVisitor />} />
                <Route path="/visitors/profile/:id" element={<VisitorProfile />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;