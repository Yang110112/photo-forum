import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo } from './store/authSlice';
import routes from './router/index';

function App() {
    const dispatch = useDispatch();
    const { token } = useSelector(state => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(fetchUserInfo());
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {routes.map((route, i) => (
                    <Route key={i} element={route.element}>
                        {route.children.map((child, j) => (
                            <Route key={j} path={child.path} element={child.element} />
                        ))}
                    </Route>
                ))}
            </Routes>
        </BrowserRouter>
    );
}

export default App;