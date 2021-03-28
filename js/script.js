function ScreenHandler() {
    // Constructors
    function Operators() {
        // Private
        let operators = {
            '+': {
                'symbol': '+',
                'precedence': 2,
                'associativity': 0,
            },
            '-': {
                'symbol': '-',
                'precedence': 2,
                'associativity': 0,
            },
            '/': {
                'symbol': '/',
                'precedence': 3,
                'associativity': 0,
            },
            '*': {
                'symbol': '*',
                'precedence': 3,
                'associativity': 0,
            },
            '^': {
                'symbol': '^',
                'precedence': 4,
                'associativity': 1,
            },
            '(': {
                'symbol': '(',
                'precedence': 0,
                'associativity': 1,
            },
            ')': {
                'symbol': ')',
                'precedence': 0,
                'associativity': 1,
            }
        }

        // Public
        this.get = function() {
            return operators;
        }
        this.isOperator = function(to_check) {
            return Object.keys(operators).includes(to_check);
        }
    };

    function InfixParser() {
        // Private
        let postfix = [];
        let opStack = [];
        let operators = new Operators;
        let number = function(char) {
            if (operators.isOperator(char)) {
                return false;
            }
            postfix.push(char);
            return true;
        }
        let opening = function(op) {
            if (op.symbol !== '(') {
                return false;
            }
            opStack.push(op);
            return true;
        }
        let closing = function(op) {
            if (op.symbol !== ')') {
                return false;
            }

            while (opStack[opStack.length - 1].symbol !== '(') {
                postfix.push(opStack.pop().symbol);
            }
            opStack.pop();
            return true;
        }
        let firstOperation = function(op) {
            if (opStack.length !== 0) {
                return 0;
            }
            if (op.symbol === ')') {
                return 1;
            }
            opStack.push(op);
            return 2;
        }
        let pushOp = function(op) {
            if (op.symbol !== ')') {
                opStack.push(op);
            }
        }
        let remainingOperators = function() {
            for (const op of opStack.reverse()) {
                postfix.push(op.symbol);
            }
        }
        let releaseStackOps = function(op) {
            var opLast = opStack[opStack.length - 1];
            while ((op.precedence < opLast.precedence) ||
                (op.precedence === opLast.precedence &&
                    op.associativity === 0)) {
                if (closing(op)) {
                    break;
                }
                postfix.push(opStack.pop().symbol);
                if (opStack.length == 0) {
                    break;
                }
                opLast = opStack[opStack.length - 1];
            }
        }

        // Public
        this.shuntingYard = function(infix) {
            const error_message = ['Invalid Syntax'];
            while (infix.length != 0) {
                const char = infix.shift();
                if (number(char)) {
                    continue;
                }
                const op = operators.get()[char];
                if (opening(op)) {
                    continue;
                }
                const retval = firstOperation(op);
                if (retval & 1) {
                    return error_message;
                }
                if (retval !== 0) {
                    continue;
                }
                releaseStackOps(op);
                pushOp(op);
            }
            remainingOperators();
            return postfix === NaN || postfix === undefined ||
                postfix === null ? error_message : postfix;
        }
        this.reset = function() {
            postfix = [];
            opStack = [];
        }
    };

    function Calculator() {
        // Private
        let calculate = function(left, right, op) {
            switch (op) {
                case '+':
                    return parseFloat(left) + parseFloat(right);
                case '-':
                    return parseFloat(left) - parseFloat(right);
                case '*':
                    return parseFloat(left) * parseFloat(right);
                case '/':
                    return parseFloat(left) / parseFloat(right);
                case '^':
                    return Math.pow(parseFloat(left), parseFloat(right));
                default:
                    return null;
            }
        }
        let operators = new Operators;

        // Public
        this.parse = function(postfix) {
            var stackLocal = [];

            for (read of postfix) {
                if (operators.isOperator(read)) {
                    rhs = stackLocal.pop();
                    lhs = stackLocal.pop();
                    stackLocal.push(calculate(lhs, rhs, read));
                } else {
                    stackLocal.push(read);
                }
            }
            return stackLocal[0];
        }
    };

    function InputHandler() {
        // Private
        let value = null;
        let infix = [];
        let getAdd = function(value) {
            return value ? '.' : '0.';
        };

        // Public
        this.update = function(new_value) {
            value = (value ? value + new_value : new_value);
        }
        this.decimal = function() {
            const add = getAdd(value);
            value = value ? value + add : add;
            return add;
        }
        this.pushOperator = function(op) {
            infix.push(op);
        }
        this.pushValue = function() {
            if (value) {
                infix.push(value);
                value = null;
            }
        }
        this.reset = function() {
            value = null;
            infix = [];
        }
        this.getInfix = function() {
            return infix;
        }
        this.empty = function() {
            return infix.length === 0 && value === null;
        }
    };

    // Private
    let input_handler = new InputHandler;
    let infix_parser = new InfixParser;
    let calculator = new Calculator;
    let clear = function() {
        $('textarea[id=results]').text('');
    }
    let conditionalClear = function() {
        if (input_handler.empty()) {
            clear();
        }
    }

    // Set Button events
    $('input.eq_button').on('click', function() {
        input_handler.pushValue();
        $('textarea[id=results]').text($('textarea[id=results]').text() + '= ' + calculator.parse(infix_parser.shuntingYard(input_handler.getInfix())));
        infix_parser.reset();
        input_handler.reset();
    });

    $('input.clear_button').on('click', function() {
        infix_parser.reset();
        input_handler.reset();
        clear();
    });

    $('input.dec_button').on('click', function() {
        conditionalClear();
        $('textarea[id=results]').text($('textarea[id=results]').text() + input_handler.decimal());
    });

    $('input.op_button').on('click', function() {
        conditionalClear();
        input_handler.pushValue();
        const op = $(this).attr('value');
        input_handler.pushOperator(op);
        $('textarea[id=results]').text($('textarea[id=results]').text() + op);
        return;
    });

    $('input.num_button').on('click', function() {
        conditionalClear();
        const new_value = $(this).attr('value');
        input_handler.update(new_value);
        $('textarea[id=results]').text($('textarea[id=results]').text() + new_value);
    });
};


screen_handler = new ScreenHandler;