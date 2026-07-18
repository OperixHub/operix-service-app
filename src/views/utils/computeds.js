import { ref } from 'vue';
import Swal from 'sweetalert2';
import { io } from 'socket.io-client';
import { getAccessToken } from '@/services/authSession';

const socket = io(import.meta.env.VITE_BASE_URL_API.replace('/api', ''), {
    autoConnect: false,
    auth: (callback) => {
        callback({ token: getAccessToken() });
    },
    transports: ['websocket']
});

const connectSocket = () => {
    if (getAccessToken() && !socket.connected) {
        socket.connect();
    }
};

const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const onlyNumbers = (value = '') =>
    value.replace(/\D/g, '');

export const formatTelephone = (value = '') => {
    const phone = onlyNumbers(value);

    if (phone.length === 11)
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

    if (phone.length === 10)
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');

    return value;
};

/* Formated Data D/M/A */
const formatData = (dataString) => {
    if (!dataString) {
        return '---';
    }
    const partes = dataString.split('-');
    if (partes.length !== 3) {
        return 'Data inválida';
    }
    const ano = partes[0].substring(2);
    const mes = partes[1];
    const dia = partes[2];
    return `${dia}/${mes}/${ano}`;
};

/* Message Whatsapp Client */
const sendWhatsAppMessage = (data, dataEstimate) => {
    const jsonData = JSON.parse(dataEstimate.estimate);
    const list = jsonData.map((item) => {
        const description = item.description.replace(/\n/g, ' ');
        return `${item.amount} - ${description}`;
    });
    const listString = list.join('\n');
    const phoneNumber = data.telephone;
    let connection = '';
    let initMessage = '';
    switch (data.product) {
        case 'Máquina de Lavar' || 'Geladeira' || 'Air Fryer' || 'Central de Ar' || 'Lava e Seca' || 'Secadora':
            connection = 'da sua';
            break;
        case 'Freezer' || 'Micro-ondas' || 'Forno Elétrico' || 'Tanquinho' || 'Expositor' || 'Bebedouro' || 'Ar-Condicionado':
            connection = 'do seu';
            break;
        case 'Outros':
            initMessage = 'Olá, vim passar o seu orçamento';
            break;
    }

    let message = '';
    if (data.product == 'Outros') {
        message = `${initMessage}!\n\n${listString}.\n\nFica no valor de R$${dataEstimate.value},00.`;
    } else {
        message = `Olá, vim passar o orçamento do conserto ${connection} ${data.product}!\n\n${listString}.\n\nFica no valor de R$${dataEstimate.value},00.`;
    }

    const encodedPhoneNumber = encodeURIComponent(phoneNumber);
    const encodedMessage = encodeURIComponent(message);

    const whatsappLink = `https://wa.me/${encodedPhoneNumber}?text=${encodedMessage}`;

    window.open(whatsappLink, '_blank');
};

/* Message Whatsapp Employeers */
const sendInfoClientsWhats = (data) => {
    let adress = '';
    let mapsLink = '';
    if (data.adress) {
        const adressFormated = encodeURIComponent(data.adress);
        adress = `\nEndereço: ${data.adress}`;
        mapsLink = `\nGoogleMaps: https://www.google.com/maps/search/?api=1&query=${adressFormated}`;
    }

    const message = `Produto: ${data.product} \nCliente: ${data.client} \nTelefone: ${data.telephone} ${adress} ${mapsLink}`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappLink = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
};

/* Loads Alert */
const loadingOpen = () => {
    Swal.fire({
        title: 'Carregando',
        didOpen: () => {
            Swal.showLoading();
        }
    });
};
const loadingClose = () => {
    Swal.close();
};

export { socket, connectSocket, disconnectSocket, formatData, sendWhatsAppMessage, sendInfoClientsWhats, loadingOpen, loadingClose };
