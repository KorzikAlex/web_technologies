import { RouterProvider } from 'react-router/dom';
import { router } from './routes';
import { useEffect } from 'react';
import { wsService } from './services/websocket';
import { useAppDispatch } from './store/hooks';

function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Connect WebSocket on app start
        wsService.connect(dispatch);

        // Cleanup on unmount
        return () => {
            wsService.disconnect();
        };
    }, [dispatch]);

    return <RouterProvider router={router} />;
}

export default App;
