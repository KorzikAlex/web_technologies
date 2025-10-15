import express, {type Router} from 'express';

const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
import db from '../db';

const ensureLoggedIn = ensureLogIn();

function fetchTodos(req, res, next) {
    db.all('SELECT * FROM todos WHERE owner_id = ?', [
        req.user.id
    ], function(err, rows) {
        if (err) { return next(err); }

        var todos = rows.map(function(row) {
            return {
                id: row.id,
                title: row.title,
                completed: row.completed == 1 ? true : false,
                url: '/' + row.id
            }
        });
        res.locals.todos = todos;
        res.locals.activeCount = todos.filter(function(todo) { return !todo.completed; }).length;
        res.locals.completedCount = todos.length - res.locals.activeCount;
        next();
    });
}

const indexRouter: Router = express.Router();

/* GET home page. */
indexRouter.get('/', function(req, res, next) {
    if (!req.user) { return res.render('home'); }
    next();
}, fetchTodos, function(req, res, next) {
    res.locals.filter = null;
    res.render('index', { user: req.user });
});

indexRouter.get('/active', ensureLoggedIn, fetchTodos, function(req, res, next) {
    res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
    res.locals.filter = 'active';
    res.render('index', { user: req.user });
});

indexRouter.get('/completed', ensureLoggedIn, fetchTodos, function(req, res, next) {
    res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
    res.locals.filter = 'completed';
    res.render('index', { user: req.user });
});

indexRouter.post('/', ensureLoggedIn, function(req, res, next) {
    req.body.title = req.body.title.trim();
    next();
}, function(req, res, next) {
    if (req.body.title !== '') { return next(); }
    return res.redirect('/' + (req.body.filter || ''));
}, function(req, res, next) {
    db.run('INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)', [
        req.user.id,
        req.body.title,
        req.body.completed == true ? 1 : null
    ], (err): void => {
        if (err) { return next(err); }
        return res.redirect('/' + (req.body.filter || ''));
    });
});

indexRouter.post('/:id(\\d+)', ensureLoggedIn, function(req, res, next) {
    req.body.title = req.body.title.trim();
    next();
}, function(req, res, next) {
    if (req.body.title !== '') { return next(); }
    db.run('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
        req.params.id,
        req.user.id
    ], (err): void => {
        if (err) { return next(err); }
        return res.redirect('/' + (req.body.filter || ''));
    });
}, function(req, res, next) {
    db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ?', [
        req.body.title,
        req.body.completed !== undefined ? 1 : null,
        req.params.id,
        req.user.id
    ], function(err) {
        if (err) { return next(err); }
        return res.redirect('/' + (req.body.filter || ''));
    });
});

indexRouter.post('/:id(\\d+)/delete', ensureLoggedIn, function(req, res, next) {
    db.run('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
        req.params.id,
        req.user.id
    ], (err): void => {
        if (err) { return next(err); }
        return res.redirect('/' + (req.body.filter || ''));
    });
});

indexRouter.post('/toggle-all', ensureLoggedIn, function(req, res, next) {
    db.run('UPDATE todos SET completed = ? WHERE owner_id = ?', [
        req.body.completed !== undefined ? 1 : null,
        req.user.id
    ], (err): void => {
        if (err) { return next(err); }
        return res.redirect('/' + (req.body.filter || ''));
    });
});

indexRouter.post('/clear-completed', ensureLoggedIn, function(req, res, next) {
    db.run('DELETE FROM todos WHERE owner_id = ? AND completed = ?', [
        req.user.id,
        1
    ], function(err) {
        if (err) { return next(err); }
        return res.redirect('/' + (req.body.filter || ''));
    });
});

export default indexRouter;