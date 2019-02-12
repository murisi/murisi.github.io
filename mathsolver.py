NUM = 0
ADD = 1
SUB = 2
MUL = 3
DIV = 4

def parse_binop(expr_str, char, tag):
	depth = 0
	for i in range(0, len(expr_str)):
		if expr_str[i] == '(':
			depth += 1
		elif expr_str[i] == ')':
			depth -= 1
		elif depth == 0 and expr_str[i] == char:
			left_expr = parse_expr(expr_str[0:i])
			right_expr = parse_expr(expr_str[i+1:len(expr_str)])
			return (tag, left_expr, right_expr)
	return None

def parse_expr(expr_str):
	expr = parse_binop(expr_str, '-', SUB)
	if expr: return expr
	expr = parse_binop(expr_str, '+', ADD)
	if expr: return expr
	expr = parse_binop(expr_str, '*', MUL)
	if expr: return expr
	expr = parse_binop(expr_str, '/', DIV)
	if expr: return expr
	if expr_str[0] == '(':
		return parse_expr(expr_str[1:-1])
	else:
		return (NUM, int(expr_str))

def expr_to_str(expr):
	if expr[0] == ADD:
		return "(" + expr_to_str(expr[1]) + ")+(" + expr_to_str(expr[2]) + ")"
	elif expr[0] == SUB:
		return "(" + expr_to_str(expr[1]) + ")-(" + expr_to_str(expr[2]) + ")"
	elif expr[0] == MUL:
		return "(" + expr_to_str(expr[1]) + ")*(" + expr_to_str(expr[2]) + ")"
	elif expr[0] == DIV:
		return "(" + expr_to_str(expr[1]) + ")/(" + expr_to_str(expr[2]) + ")"
	if expr[0] == NUM:
		return str(expr[1])

def eval_expr(expr):
	if expr[0] == ADD:
		return eval_expr(expr[1]) + eval_expr(expr[2])
	elif expr[0] == SUB:
		return eval_expr(expr[1]) - eval_expr(expr[2])
	elif expr[0] == MUL:
		return eval_expr(expr[1]) * eval_expr(expr[2])
	elif expr[0] == DIV:
		return eval_expr(expr[1]) / eval_expr(expr[2])
	if expr[0] == NUM:
		return expr[1]

def is_frac(expr):
	return expr[0] == DIV and expr[1][0] == NUM and expr[2][0] == NUM

def to_frac(expr, steps):
	if expr[0] == NUM:
		expr1 = (DIV, expr, (NUM, 1))
		steps.append((expr, expr1, "Turned the number " + expr_to_str(expr) + " into a fraction by dividing it by 1."))
		return expr1
	else: return expr

def add_frac(expr, steps):
	expr1 = (ADD, to_frac(expr[1], steps), to_frac(expr[2], steps))
	expr2 = (ADD, (DIV, (NUM, expr1[1][1][1] * expr1[2][2][1]), (NUM, expr1[1][2][1] * expr1[2][2][1])),
		(DIV, (NUM, expr1[2][1][1] * expr1[1][2][1]), (NUM, expr1[2][2][1] * expr1[1][2][1])))
	steps.append((expr1, expr2, "Equalized denominators by multiplying numerator and denominator of "
		+ expr_to_str(expr1[1]) + " by " + expr_to_str(expr1[2][2]) + " and the numerator and denominator of "
		+ expr_to_str(expr1[2]) + " by " + expr_to_str(expr1[1][2]) + "."))
	expr3 = (DIV, (NUM, expr2[1][1][1] + expr2[2][1][1]), expr2[1][2])
	steps.append((expr2, expr3, "Added the numerators of " + expr_to_str(expr2[1]) + " and " + expr_to_str(expr2[2])
		+ " together."))
	return expr3

def sub_frac(expr, steps):
	expr1 = (SUB, to_frac(expr[1], steps), to_frac(expr[2], steps))
	expr2 = (SUB, (DIV, (NUM, expr1[1][1][1] * expr1[2][2][1]), (NUM, expr1[1][2][1] * expr1[2][2][1])),
		(DIV, (NUM, expr1[2][1][1] * expr1[1][2][1]), (NUM, expr1[2][2][1] * expr1[1][2][1])))
	steps.append((expr1, expr2, "Equalized denominators by multiplying numerator and denominator of "
		+ expr_to_str(expr1[1]) + " by " + expr_to_str(expr1[2][2]) + " and the numerator and denominator of "
		+ expr_to_str(expr1[2]) + " by " + expr_to_str(expr1[1][2]) + "."))
	expr3 = (DIV, (NUM, expr2[1][1][1] - expr2[2][1][1]), expr2[1][2])
	steps.append((expr2, expr3, "Subtracted the numerator of " + expr_to_str(expr2[2]) + " from " + expr_to_str(expr2[1]) + "."))
	return expr3

def mul_frac(expr, steps):
	expr1 = (MUL, to_frac(expr[1], steps), to_frac(expr[2], steps))
	expr2 = (DIV, (NUM, expr1[1][1][1] * expr1[2][1][1]), (NUM, expr1[1][2][1] * expr1[2][2][1]))
	steps.append((expr1, expr2, "Multiplied the numerators and denominators of " + expr_to_str(expr1[1]) + " and "
		+ expr_to_str(expr1[2]) + " together."))
	return expr2

def div_frac(expr, steps):
	if is_frac(expr[1]) or is_frac(expr[2]):
		expr1 = (DIV, to_frac(expr[1], steps), to_frac(expr[2], steps))
		expr2 = (MUL, expr1[1], (DIV, expr1[2][2], expr1[2][1]))
		steps.append((expr1, expr2, "Multiply by the reciprocal of " + expr_to_str(expr1[2]) + " instead of dividing by it."))
		expr3 = (DIV, (NUM, expr2[1][1][1] * expr2[2][1][1]), (NUM, expr2[1][2][1] * expr2[2][2][1]))
		steps.append((expr2, expr3, "Multiplied the numerators and denominators of " + expr_to_str(expr2[1]) + " and "
			+ expr_to_str((DIV, expr1[2][2], expr1[2][1])) + " together."))
		return expr3
	else: return expr

def simplify_frac(expr, steps):
	if expr[0] == NUM:
		return expr
	elif expr[0] == ADD:
		return add_frac((ADD, simplify_frac(expr[1], steps), simplify_frac(expr[2], steps)), steps)
	elif expr[0] == SUB:
		return sub_frac((SUB, simplify_frac(expr[1], steps), simplify_frac(expr[2], steps)), steps)
	elif expr[0] == MUL:
		return mul_frac((MUL, simplify_frac(expr[1], steps), simplify_frac(expr[2], steps)), steps)
	elif expr[0] == DIV:
		return div_frac((DIV, simplify_frac(expr[1], steps), simplify_frac(expr[2], steps)), steps)
	return expr

def print_log(steps):
	for entry in steps:
		print(expr_to_str(entry[0]) + " -> " + expr_to_str(entry[1]) + " (" + entry[2] + ")\n")

# Print the steps to simplify the expression ((5/3+6+7/2)*5/3)/(1/2)
steps = []
simplify_frac(parse_expr("((5/3+6+7/2)*5/3)/(1/2)"), steps)
print_log(steps)

