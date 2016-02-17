var annotation = {};

annotation.group = graph;
annotation.type = type;
annotation.typeLabel = typeLabel;

annotation.target = {
    source: elem.src.value,
    id: elem.fragment.value,
    start: elem.start.value,
    end: elem.end.value
};

annotation.provenance = {
    author: {
        name: elem.provenanceLabel.value || elem.provenanceMail.value,
        mail: elem.provenanceMail.value
    },
    time: elem.time.value
};

annotation.content = {
    value: annot.object.value,
    label: annot.bodyLabel ? annot.bodyLabel.value : undefined,
    subject: what,
    object: whattt,
    cited: annot.object.value // Citation only
};

/**
 * type OK
 * target OK
 * provenance OK
 *
 * value OK TRANNE CIT
 *
 * typelabel 
 * group
 * label
 * object
 * subject
 * ?cited?
 *
 */
