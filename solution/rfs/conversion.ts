//# server typescript program conversion for schedule * * * * * first run at 2100-01-01 00:00

export class nuf {
  decimalSeparator: string;
  groupSize: number;
  groupSeparator: string;
}

let rgstdtf: string[] = ["yyyy\".\"MM\".\"dd\".\"", "yyyy\". \"MM\". \"dd\".\"", "yyyy\"-\"MM\"-\"dd", "yyyy\":\"MM\":\"dd", "dd\".\"MM\".\"yyyy\".\"", "dd\". \"MM\". \"yyyy\".\"", "dd\"-\"MM\"-\"yyyy", "dd\":\"MM\":\"yyyy"];
let rgnf: nuf[] = [
  {decimalSeparator: ",",  groupSize: 3, groupSeparator: "."},
  {decimalSeparator: ",",  groupSize: 3, groupSeparator: " "},
  {decimalSeparator: ".",  groupSize: 3, groupSeparator: " "},
  {decimalSeparator: ".",  groupSize: 3, groupSeparator: ","}
];

export function DateFrom(st: string): dtdb {
    if (st === null || st === undefined) 
        return null;

    Log(["rgstdtf", rgstdtf]);
    for (let stdtf of rgstdtf) {
      Log(["stdtf", stdtf]);
      let dtlIssueDate = dtl.Parse(dtf.Parse(stdtf), st);
      if (dtlIssueDate !== undefined) {
        Log(["date", st, "parsed with ", stdtf, ": ", dtlIssueDate.DtlToDtdb()]);
        return dtlIssueDate.DtlToDtdb();
      }
    }
    return null;
};

export function NumberFrom(st: string): number {
    Log([st]);
    if (st === null || st === undefined || st === "") 
        return null;
    for (let nf of rgnf) {
        // let n = float.ParseNuf(nf, st);
        let stregexNuf = '^[+-]?([0-9]{1,'+nf.groupSize+'}('+escapeRegExp(nf.groupSeparator)+'[0-9]{'+nf.groupSize+'})*'
                      +'('+escapeRegExp(nf.decimalSeparator)+'[0-9]+)?|\\d*'+escapeRegExp(nf.decimalSeparator)+'\\d+|\\d+)$';
        Log(["regex: ", stregexNuf]);
        let regex = RegExp(stregexNuf);
        let fMatch = regex.test(st);
        if (!fMatch) continue;

        const stReplaced = st.replace(escapeRegExp(nf.groupSeparator), '').replace(escapeRegExp(nf.decimalSeparator), '\.');
        Log(["stReplaced: ", stReplaced]);
        let n = parseFloat(stReplaced); 
        if (n !== undefined && !Number.isNaN(n))  {
          return n;
        }
      }
      return null;
};

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function parseNumber(value) {
  const example = Intl.NumberFormat("hu").format(1.1);
  const cleanPattern = new RegExp(`[^-+0-9${ example.charAt( 1 ) }]`, 'g');
  const cleaned = value.replace(cleanPattern, '');
  const normalized = cleaned.replace(example.charAt(1), '.');
  return parseFloat(normalized);

}
