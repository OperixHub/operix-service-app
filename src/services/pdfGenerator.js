import pdfMake from 'pdfmake/build/pdfmake';

const PDF_FONTS = {
    Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
    }
};

const cloneData = (data) => {
    return JSON.parse(JSON.stringify(data));
};

const getFormattedDateLocale = () => {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${day}/${month}/${year}`;
};

const parseEstimate = (estimate) => {
    if (Array.isArray(estimate)) {
        return estimate;
    }

    if (typeof estimate === 'string') {
        try {
            return JSON.parse(estimate);
        } catch (error) {
            console.error('Erro ao converter orçamento:', error);
            return [];
        }
    }

    return [];
};

const formatCurrency = (value) => {
    const numericValue = Number(value ?? 0);

    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

const createTableData = (estimate, totalValue) => {
    const header = [
        {
            fillColor: '#EEF9FC',
            text: 'QUANT.',
            bold: true,
            style: 'text_table_os'
        },
        {
            fillColor: '#EEF9FC',
            text: 'DESCRIÇÃO',
            bold: true,
            style: 'text_table_os'
        },
        {
            fillColor: '#EEF9FC',
            text: 'VALOR',
            bold: true,
            style: 'text_table_os'
        }
    ];

    const rows = estimate.map((item) => [
        {
            text: String(item.amount ?? ''),
            style: 'text_result_os'
        },
        {
            text: String(item.description ?? ''),
            style: 'text_result_os'
        },
        {
            text: formatCurrency(item.price),
            style: 'text_result_os'
        }
    ]);

    const totalRow = [
        {
            text: '',
            border: []
        },
        {
            color: '#050A4D',
            text: 'VALOR TOTAL:',
            alignment: 'right',
            bold: true,
            border: []
        },
        {
            fillColor: '#EEF9FC',
            text: formatCurrency(totalValue),
            bold: true,
            style: 'text_table_os'
        }
    ];

    return [header, ...rows, totalRow];
};

const createTableLayout = () => ({
    hLineWidth: () => 1,
    vLineWidth: () => 1,
    hLineColor: () => 'gray',
    vLineColor: () => 'gray',
    paddingTop: () => 10,
    paddingBottom: () => 10
});

const createHeader = (logo) => {
    const columns = [];

    if (logo) {
        columns.push({
            image: logo,
            style: 'image',
            width: 220,
            height: 75
        });
    }

    columns.push({
        text: 'TELEFONE: (94) 99196-4476\n\nRUA C-DOIS, N 16, CAPUAVA 1, REDENÇÃO-PA',
        style: 'text_info_header',
        bold: true
    });

    return {
        alignment: 'center',
        columns
    };
};

const createDocumentDefinition = ({
    info,
    date,
    tableData,
    logo
}) => ({
    pageSize: 'A4',

    content: [
        createHeader(logo),

        '\n\n',

        {
            text: `DATA: ${date}`,
            style: 'text_info_client'
        },

        '\n',

        {
            alignment: 'justify',
            columns: [
                {
                    text: `PRODUTO: ${info.product ?? ''}`,
                    style: 'text_info_client'
                },
                {
                    text: `OS: ${info.order_of_service ?? ''}`,
                    style: 'text_info_client'
                }
            ]
        },

        '\n',

        {
            alignment: 'justify',
            columns: [
                {
                    text: `NOME: ${info.client ?? ''}`,
                    style: 'text_info_client'
                },
                {
                    text: `TELEFONE: ${info.telephone ?? ''}`,
                    style: 'text_info_client'
                }
            ]
        },

        '\n',

        {
            text: `ENDEREÇO: ${info.adress ?? ''}`,
            style: 'text_info_client'
        },

        '\n\n',

        {
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto'],
                body: tableData
            },
            layout: createTableLayout()
        },

        '\n\n\n\n',

        {
            alignment: 'center',
            columns: [
                {
                    color: '#050A4D',
                    text:
                        '_______________________________________\n' +
                        'ASSINATURA DO TÉCNICO'
                },
                {
                    color: '#050A4D',
                    text:
                        '_______________________________________\n' +
                        'ASSINATURA DO CLIENTE'
                }
            ]
        }
    ],

    styles: {
        image: {
            margin: [0, 0, 0, 20],
            alignment: 'center'
        },

        text_info_header: {
            color: '#050A4D',
            alignment: 'center',
            margin: [25, 20, 0, 20]
        },

        text_info_client: {
            color: '#050A4D'
        },

        text_table_os: {
            alignment: 'center',
            color: '#050A4D'
        },

        text_result_os: {
            alignment: 'center'
        }
    },

    defaultStyle: {
        font: 'Roboto'
    }
});

const generateReceipt = (dataInfo, dataOS, logo = null) => {
    const info = cloneData(dataInfo);
    const orderService = cloneData(dataOS);

    const date = getFormattedDateLocale();
    const estimate = parseEstimate(orderService.estimate);

    const tableData = createTableData(
        estimate,
        orderService.value
    );

    const documentDefinition = createDocumentDefinition({
        info,
        date,
        tableData,
        logo
    });

    pdfMake.fonts = PDF_FONTS;

    pdfMake
        .createPdf(documentDefinition)
        .open();
};

export {
    generateReceipt,
    getFormattedDateLocale,
    formatCurrency
};

export default {
    generateReceipt
};
