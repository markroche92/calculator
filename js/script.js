var CalculatorApp = {
    calculator: {
        'input': [],
        'reset': function() {
            this.input = [];
        },
        'isOperator': function(to_check) {
            return to_check === '+' || to_check === '-' || to_check === '*' || to_check === '+' || to_check === '^';
        },
        'calculate': function(left, right, op) {
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
        },
        'parse': function() {
            var idx = 0;
            var stackLocal = [];
            console.log("input: " + this.input);
            while (idx < this.input.length) {
                const read = this.input[idx];
                if (this.isOperator(read)) {
                    rhs = stackLocal.pop();
                    lhs = stackLocal.pop();
                    stackLocal.push(this.calculate(lhs, rhs, read));
                } else {
                    stackLocal.push(read);
                }
                console.log("considered " + read + ": " + stackLocal[0]);
                idx++;
            }
            return stackLocal[0];
        }
    },
    value: null,
    op: null,
    update: function(new_value) {
        this.value = (this.value ? this.value + new_value : new_value);
    },
    reset: function() {
        this.value = null;
        this.calculator.reset();
    },
    clear: function() {
        $('textarea[id=results]').text('');
    },
    decimal: function() {
        var getAdd = function(value) {
            return value ? '.' : '0.';
        };
        var add = getAdd(this.value);
        this.value = this.value ? this.value + add : add;
        return add;
    },
    pushOperator: function() {
        if (this.op) {
            this.calculator.input.push(this.op);
            this.op = null;
        }
    },
    pushValue: function() {
        if (this.value) {
            // Push the last value being created
            this.calculator.input.push(this.value);
            this.value = null;
        }
    }
};

$('input.op_button').on('click', function() {
    CalculatorApp.pushValue();
    CalculatorApp.pushOperator();
    CalculatorApp.op = $(this).attr('value');
    $('textarea[id=results]').text($('textarea[id=results]').text() + CalculatorApp.op);
    return;
});

$('input.num_button').on('click', function() {
    const new_value = $(this).attr('value');
    CalculatorApp.update(new_value);
    $('textarea[id=results]').text($('textarea[id=results]').text() + new_value);
});

$('input.eq_button').on('click', function() {
    CalculatorApp.pushValue();
    CalculatorApp.pushOperator();
    $('textarea[id=results]').text($('textarea[id=results]').text() + '= ' + CalculatorApp.calculator.parse());
    CalculatorApp.reset();
});

$('input.clear_button').on('click', function() {
    CalculatorApp.reset();
    CalculatorApp.clear();
});

$('input.dec_button').on('click', function() {
    $('textarea[id=results]').text($('textarea[id=results]').text() + CalculatorApp.decimal());
});