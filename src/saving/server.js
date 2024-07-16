import express from 'express';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());


// GET запрос для чтения данных из куки на сервере и отправки на клиент
app.get('/getCookieData', (req, res) => {
    try {
        // Читаем данные из JSON-файла
        const jsonData = fs.readFileSync('savedData.json', 'utf8');
        const data = JSON.parse(jsonData);

        // Отправляем данные на клиент в виде JSON
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Произошла ошибка при чтении данных из файла');
    }
});

// POST запрос для сохранения данных на сервере и отправки на клиент
app.post('/saveData', (req, res) => {
    const data = req.body;

    if (!data) {
        return res.status(400).send('Данные не были переданы');
    }

    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync('savedData.json', jsonData);

        // Отправляем данные на клиент в виде JSON
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Произошла ошибка при сохранении данных');
    }
});

// Запускаем сервер на указанном порту
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
    if (!fs.existsSync('savedData.json')) {
        const initialObjet = init();
        
        fs.writeFileSync('savedData.json', JSON.stringify(initialObjet));

    }

});

app.get('/selectRandomDialog', (req, res) => {
    try {
        // Читаем данные из queries.json
        const jsonData = fs.readFileSync('../queries.json', 'utf8');
        const savedData = fs.readFileSync('./savedData.json', 'utf8');

        const dialogs = JSON.parse(jsonData);
        const parsedSavedData = JSON.parse(savedData);
        

        const openedFlowers = parsedSavedData.flowers.filter((el) => el.isOpen );
        const openedCategories = new Set(...openedFlowers.map(flower => flower.categories));

        // Читаем данные из usedDialogsIds.json
        let usedIds = [];
        if (fs.existsSync('usedDialogsIds.json')) {
            const usedIdsJson = fs.readFileSync('usedDialogsIds.json', 'utf8');
            usedIds = JSON.parse(usedIdsJson);
        }

        // Фильтруем доступные диалоги, чтобы не повторяться
        let availableDialogs = dialogs.filter(dialog => !usedIds.includes(dialog.id));

        // Фильтруем диалоги по пересечению категорий
        availableDialogs = availableDialogs.filter(dialog => {
            const dialogCategories = new Set(dialog.categories);
            for (let category of dialogCategories) {
                if (openedCategories.has(category)) {
                    return true;
                }
            }
            return false;
        });

        if (availableDialogs.length === 0) {
            // Если все диалоги уже использованы или нет пересечений категорий, отправляем сообщение об этом
            return res.status(404).send('Все диалоги уже использованы или нет пересечений категорий');
        }

        // Выбираем случайный диалог из доступных
        const randomDialog = availableDialogs[Math.floor(Math.random() * availableDialogs.length)];

        // Читаем файлы изображений в папке public/images/customers
        const imageDir = path.join('../../public/images/customers');
        const imageFiles = fs.readdirSync(imageDir);

        // Выбираем случайное изображение
        const randomImageName = imageFiles[Math.floor(Math.random() * imageFiles.length)];

        // Добавляем номер изображения к выбранному диалогу
        randomDialog.imageNumber = randomImageName.split('.')[0];

        // Записываем id выбранного диалога в usedDialogsIds.json
        usedIds.push(randomDialog.id);
        fs.writeFileSync('usedDialogsIds.json', JSON.stringify(usedIds));

        // Отправляем выбранный диалог на клиент в виде JSON
        res.json(randomDialog);
    } catch (err) {
        console.error(err);
        res.status(500).send('Произошла ошибка при выборе случайного диалога');
    }
});


function init() {
    return {
        money: 4000,
        experience: 1200,
        day: 1,
        unlockPrice: 4000,
        flowers: JSON.parse(fs.readFileSync("../transformedFlowersWithCategories.json")),
        flowersQueue: []
    };
}