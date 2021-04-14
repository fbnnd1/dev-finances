const Modal = {
    open() { //Abrir modal
        document.querySelector('#modalForm.modal-overlay')
            .classList.add('active');
    },
    close() { //Fechar modal
        document.querySelector('#modalForm.modal-overlay')
            .classList.remove('active');
    }
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];

    },
    set (transactions) {
        localStorage.setItem("dev.finances:transactions",
            JSON.stringify(transactions)
        );
    }
};

const Transaction = {
    all: Storage.get(),
    
    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() { //Somar as entradas
    
        let income = 0;
        /*
        Transaction.all.forEach((transaction) => {
            if (transaction > 0 ) {
                income = income + transaction.amount;
                //income += transaction;

            }
        });
        */
       //Somando com reduce()
        income = Transaction.all.reduce((sumValues, transaction) => {
            if (transaction.amount > 0) {
                return sumValues + transaction.amount;
            }
            return sumValues;
        }, 0);

        return income;
    },
    expenses() { //Somar as saídas
        let expense = 0;
        /*
        Transaction.all.forEach((transaction) => {
            if (transaction < 0 ) {
                expense = expense + transaction;
                //expense += transaction;
            }
        });
        */
       //Somando com reduce()
       expense = Transaction.all.reduce((sumValues, transaction) => {
        if (transaction.amount < 0) {
            return sumValues + transaction.amount;
        }
        return sumValues;
        }, 0);

        return expense;
    },
    total() { // Entradas - saídas
        return Transaction.incomes() + Transaction.expenses();
    }
};


const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount >= 0 ? "income" : "expensive";
        
        const amount = Utils.formatCurrent(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td>${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover transação" />
            </td>
        `;
        return html;
    },

    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrent( Transaction.incomes() );

        document.getElementById("expenseDisplay").innerHTML =  Utils.formatCurrent( Transaction.expenses() );

        document.getElementById("totalDisplay").innerHTML =  Utils.formatCurrent( Transaction.total() );
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    },

    innerHTMLExtractTransaction(transaction, balance) {
        const CSSclassAmount = transaction.amount >= 0 ? "income" : "expensive";
        const CSSclassBalance = balance >= 0 ? "positive" : "negative";
        
        const amount = Utils.formatCurrent(transaction.amount);
        const formattedBalance = Utils.formatCurrent(balance);

        const html = `
            <td>${Utils.formatDate(transaction.inFullDate)}</td>
            <td class="description">${transaction.description}</td>
            <td class="${CSSclassAmount}">${amount}</td>
            <td class="${CSSclassBalance}">${formattedBalance}</td>
        `;
        return html;
    },

    innerHTML_ExtractTransactions(extractTransactions) {

        let balance = 0;
        let htmlTransactions = "";

        for (let extractTransaction of extractTransactions) { //Para cada elemento do array
            balance = balance + extractTransaction.amount;
            htmlTransactions += "<tr>" + DOM.innerHTMLExtractTransaction(extractTransaction, balance ) + "</tr>";
        }

       return htmlTransactions;
    
    }
};

/*
transactions.forEach(function(transaction) {
    DOM.addTransaction(transaction);    
}
);
*/

const Utils = {
    formatCurrent(value) {
        const signal = Number(value) < 0 ? "- " : "";

        value = String(value).replace(/\D/g, "");
        
        value = Number(value) / 100;

        value = value.toLocaleString("pt-br", {style: "currency", currency: "BRL"});

        return signal + value;
    },
    formatAmount(value) {
        value = Number(value) * 100;
        return value;
    },
    formatDate(value) {

        if (value.indexOf("-") != -1) {
            const splittedDate = value.split("-");
            return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
        }

        return `${value.substring(6,8)}/${value.substring(4,6)}/${value.substring(0,4)}`;
    }
};

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    positiveSignal: document.querySelector("input#positive_signal"),
    negativeSignal: document.querySelector("input#negative_signal"),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.negativeSignal.checked ? '-' + Form.amount.value : Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() { //Verificar se todas as informações foram preenchidos
        const {description, amount, date } = Form.getValues();

        if  (
                description.trim() === "" ||
                amount.trim() === "" ||
                date.trim() === ""
            ) 
        {
            throw new Error("Por favor, preencha todos os campos");
        }
    },
    formatValues() {
        let {description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date   = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction);
    },
    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
        Form.positiveSignal.checked = true;
        Form.negativeSignal.checked = false;
    },
    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields(); //Verificar se todas as informações foram preenchidos
            const transaction = Form.formatValues(); //formatar os dados para salvar
            Form.saveTransaction(transaction); //salvar 
            Form.clearFields(); //apagar os dados do formulário
            Modal.close(); //fechar modal
        }
        catch(error) {
            alert(error.message);
        }

    }
};

const App = {
    init() {
         /*
        Transaction.all.forEach( DOM.addTransaction)
        */
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });
       
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    },

    openExtract() {
        if (Transaction.all.length == 0) {
            return;
        }

        Extract.init();

        const html = `
            <!DOCTYPE html>
            <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,400;0,700;1,100;1,400;1,700&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="style.css">
                    <title>Dev.finance$ - Extrato</title>
                </head>
                <body>
                    <main>
                        <section id="extract">
                            <h2>Extrato das transações</h2>
                            <table id="extract-data-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Transação</th>
                                        <th>Valor</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${DOM.innerHTML_ExtractTransactions( Extract.transactions )}
                                </tbody>
                            </table>
                            
                        </section>
                    </main>
                </<body>
            </html>
        `;

        const new_WindowExtract = window.open();

        new_WindowExtract.document.write(html);
    }
};

const Extract = {

    transactions: [],

    sortTransactions() {

        for (let i = 0; i < this.transactions.length; i++ ) {
            let earlyTransaction = i;

            for (let j = i + 1; j < this.transactions.length; j++) {

                if (this.transactions[j].inFullDate < this.transactions[earlyTransaction].inFullDate) {
                    earlyTransaction = j;
                }
            }

            if (i != earlyTransaction) {
                let tempTransaction = this.transactions[i];
                this.transactions[i] = this.transactions[earlyTransaction];
                this.transactions[earlyTransaction] = tempTransaction;
            }

        }
    },

    getTransactions() {
        this.transactions = Transaction.all.map((transaction) => {

            const { description, amount, date } = transaction;
    
            const [ day, month, year ] = date.split("/");
    
            const inFullDate = year + month  + day;
    
            return { description, amount, inFullDate  };
    
        }, 0);
    },

    init() {
        this.getTransactions();
        this.sortTransactions();
    }


};

App.init();