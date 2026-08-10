from decimal import Decimal

def multiply(*args):
    result =  Decimal(1)
    for num in args:
        result = round(result * Decimal(num), 8)
  
    return float(result)


def add(*args):
    result =  Decimal(0)
    for num in args:
        result = round(result + Decimal(num), 8)
  
    return float(result)

def sub(base, substractor):
    return float(round(Decimal(base) - Decimal(substractor), 8))

def divider(dividend, divider):
    return float(round(Decimal(dividend)/ Decimal(divider), 8))

