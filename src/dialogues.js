import { ref, watch, onMounted } from 'vue';


export default function useDialogs() {
    const dialogData = ref([]);


    const receiveDialog = async () => {
        try {
            const response = await fetch('/api/selectRandomDialog');
            if (!response.ok) throw new Error('Ошибка при получении данных с сервера');
            const data = await response.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    }

    async function getDialogs(dialogsCount = 10) {
        const storedData = localStorage.getItem('dialogs');
        if (!storedData) {
            for (var i = 0; i < dialogsCount; i++) {
                dialogData.value.push(await receiveDialog());
                localStorage.setItem('dialogs', JSON.stringify(storedData));
            }
        } else {
            dialogData.value = JSON.parse(storedData);
        }
    }


    const updateLocalAndServer = () => {
        localStorage.setItem('dialogs', JSON.stringify(dialogData.value));
    };

    onMounted(async () => {
        await getDialogs(10);
    });

    watch(dialogData, updateLocalAndServer, { deep: true });


    return {
        dialogData,
        getDialogs
    }
}