//# server typescript program library for schedule * * * * * first run at 2100-01-01 00:00

export function getItemUnitFrom(firstItemUnit: string = "", currentItemUnit: string = "", firstItem: bool): string {
	const mark = "***";
	if(!!firstItemUnit){ // [null,undefined,""] values are "falsy", string values e.g. ["feet","piece"] are "truthy"
		if(firstItemUnit.endsWith(mark)){
			const firstItemUnitWithoutMark = firstItemUnit.slice(0, -mark.length).trimEnd();
			if(firstItem){return firstItemUnitWithoutMark;}
			return currentItemUnit || firstItemUnitWithoutMark; //returns the first string if it has value otherwise the second
		}
		return currentItemUnit;
	}
	return currentItemUnit;
}