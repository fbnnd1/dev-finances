const Modal = {
    open() { //Abrir modal
        document.querySelector('.modal-overlay')
            .classList.add('active');
    },
    close() { //Fechar modal
        document.querySelector('.modal-overlay')
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
        const splittedDate = value.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
};

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
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
    },
    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields(); //Verificar se todas as informações foram preenchidos
            const transaction = Form.formatValues(); //formatar os daados para salvar
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
    }
};

App.init();