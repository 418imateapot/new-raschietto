import unicodedata
def string2rschAuthor(fullname):
    """
    Genera un nome nel formato di Raschietto a partire dalla stringa passata come argomento.
    :param string: fullname il nome e cognome di un autore.
    :returns string: il nome opportunamente modificato
    """
    fullname = unicodedata.normalize('NFKD',unicode(fullname,"utf-8")).encode("ascii","ignore")
    # sostituisce i caratteri accentati con i "corrispettivi" caratteri ASCII
    # http://stackoverflow.com/questions/3704731/replace-non-ascii-chars-from-a-unicode-string-in-python

    fullname = fullname.lower()  # trasforma eventuali maiuscole in minuscole

    for n in (range(33, 48) + range(58, 97) + range(123, 127)):  # rimuove la punteggiatura
        fullname = fullname.replace(chr(n),'')

    parts = fullname.split()
    if len(parts) == 2:
        return parts[0][0] + '-' + parts[1]
    elif len(parts) >= 2:
        return parts[0][0] + '-' + parts[-2] + parts[-1]
    else:
        return fullname



import sys

name = sys.argv[1]
print string2rschAuthor(name)
