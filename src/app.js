'use strict'

const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

function logRequests(req, res, next) {
    const { method, url } = req;

    const log = `[${method}] ${url}`;

    console.time(log);
    next();
    console.timeEnd(log);
}

function validateProjectId(request, response, next) {
    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({ error: 'Invalid project ID.' });
    }

    return next();
}

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.use(logRequests);
app.use('/repositories/:id', validateProjectId);

app.post("/repositories", (request, response) => {
    const { title, url, techs } = request.body;

    const newRepository = {
        id: uuid(),
        url,
        title,
        techs,
        likes: 0
    };

    repositories.push(newRepository);

    const newRepositoryToReturn = {...newRepository };

    return response.status(200).json(newRepositoryToReturn);
});

app.get("/repositories", (request, response) => {
    // const { title, owner }

    const repositoriesToReturn = repositories.map(repository => {
        return {...repository };
    });

    return response.status(200).json(repositoriesToReturn);
});

app.put("/repositories/:id", (request, response) => {
    const { title, url, techs } = request.body;
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(400).json({ error: 'Project not found.' });
    }

    const newRepository = {
        id: repositories[repositoryIndex].id,
        title,
        url,
        techs,
        likes: 0
    };

    repositories[repositoryIndex] = newRepository;

    return response.status(200).json(newRepository);
});

app.delete("/repositories/:id", (request, response) => {
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(400).json({ error: 'Repository not found.' });
    }

    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);

    if (repositoryIndex < 0) {
        return response.status(400).json({ error: 'Repository not found.' });
    }

    const newRepository = {...repositories[repositoryIndex], likes: repositories[repositoryIndex].likes + 1 };

    repositories[repositoryIndex] = newRepository;

    const newRepositoryToReturn = {...newRepository };

    return response.status(200).json(newRepositoryToReturn);
});

module.exports = app;
