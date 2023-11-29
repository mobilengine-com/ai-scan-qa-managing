export {};

declare global {

/** Boolean value */
class bool {
	/** Converts the specified string representation of a logical value to its boolean equivalent, returns <<undefined>> if the conversion fails. */
	static Parse(st: string): boolean | undefined;
}
interface Boolean {
	/** Converts the value to its equivalent string representation. */
	ToString(): string;
}

/** Represents date coming from database.
You need to explicitly designate dtdb to either dtl or dtu (using DeclareFoo) in order to use it.
You need to explicitly convert dtl or dtu to dtdb before writing it to the database (using FooToDtdb).
NOTE: these methods will not perform actual timezone conversion hence dtl.DtlToDtdb().DeclareAsDtu() will fail. */
class dtdb {
}
interface dtdb {
	/** Declares the value as dtu. */
	DeclareAsDtu(): dtu;
	/** Declares the value as dtl. */
	DeclareAsDtl(): dtl;
}

/** Datetime format */
class dtf {
	/** Create a Dtf from a string. */
	static Parse(rv: string): dtf;
}

/** Datetime (Company local timezone) */
class dtl {
	/** Creates a new dtl object with the specified year, month, day, hour, minute, second, and millisecond. */
	static New(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number): dtl;
	/** Creates a new dtl object that is set to the current date and time on this computer, expressed as company local time. */
	static Now(): dtl;
	/** Converts the specified string representation of a date and time to its dtl equivalent using the specified format information. Returns <<unknown>> if the conversion fails. */
	static Parse(rvDtf: dtf, st: string): dtl | undefined;
}
interface dtl {
	/** Converts the specified dtl value to its dtdb equivalent. */
	DtlToDtdb(): dtdb;
	/** Converts the specified dtl value to its dtu equivalent. */
	DtlToDtu(): dtu;
	/** Returns a new dtl that adds the specified number of years to the value of this object. */
	DtlAddYears(cyear: number): dtl;
	/** Returns a new dtl that adds the specified number of months to the value of this object. */
	DtlAddMonths(cmonth: number): dtl;
	/** Returns a new dtl that adds the specified number of days to the value of this object. */
	DtlAddDays(cday: number): dtl;
	/** Returns a new dtl that adds the specified number of hours to the value of this object. */
	DtlAddHours(chour: number): dtl;
	/** Returns a new dtl that adds the specified number of minutes to the value of this object. */
	DtlAddMinutes(cmoh: number): dtl;
	/** Returns a new dtl that adds the specified number of seconds to the value of this object. */
	DtlAddSeconds(csecond: number): dtl;
	/** Returns a new dtl that adds the specified number of milliseconds to the value of this object. */
	DtlAddMilliseconds(cmillis: number): dtl;
	/** Returns the start of the day. */
	StartOfDay(): dtl;
	/** Returns the start of the month. */
	StartOfMonth(): dtl;
	/** Returns the start of the year. */
	StartOfYear(): dtl;
	/** Returns the day of the week: 0-6, with Sunday as 0 and Saturday as 6 */
	DayOfWeek(): number;
	/** Returns the week of the year defined by ISO 8601 */
	WeekOfYear(): number;
	/** Returns difference between dates as a timespan */
	Diff(dtlOther: dtl): timespan;
	/** Returns the date created by adding the timespan to this date */
	Add(timespan: timespan): dtl;
	/** Returns the date created by subtracting the timespan from this date */
	Subtract(timespan: timespan): dtl;
	/** Converts the value of the current dtl object to its equivalent string representation using the specified format. */
	Format(rvDtf: dtf): string;
	/** No docs */
	Year: number;
	/** No docs */
	Month: number;
	/** No docs */
	Day: number;
	/** No docs */
	Hour: number;
	/** No docs */
	Minute: number;
	/** No docs */
	Second: number;
	/** No docs */
	Millisecond: number;
}

/** Datetime (UTC) */
class dtu {
	/** Creates a new dtu object with the specified year, month, day, hour, minute, second, and millisecond. */
	static New(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number): dtu;
	/** Creates a new dtu object that is set to the current date and time on this computer, expressed as the UTC time. */
	static Now(): dtu;
	/** Converts the specified string representation of a date and time to its dtu equivalent using the specified format information. Returns <<unknown>> if the conversion fails. */
	static Parse(rvDtf: dtf, st: string): dtu | undefined;
}
interface dtu {
	/** Converts the specified dtu value to its dtdb equivalent. */
	DtuToDtdb(): dtdb;
	/** Converts the specified dtu value to its dtl equivalent. */
	DtuToDtl(): dtl;
	/** Returns a new dtu that adds the specified number of years to the value of this object. */
	DtuAddYears(cyear: number): dtu;
	/** Returns a new dtu that adds the specified number of months to the value of this object. */
	DtuAddMonths(cmonth: number): dtu;
	/** Returns a new dtu that adds the specified number of days to the value of this object. */
	DtuAddDays(cday: number): dtu;
	/** Returns a new dtu that adds the specified number of hours to the value of this object. */
	DtuAddHours(chour: number): dtu;
	/** Returns a new dtu that adds the specified number of minutes to the value of this object. */
	DtuAddMinutes(cmoh: number): dtu;
	/** Returns a new dtu that adds the specified number of seconds to the value of this object. */
	DtuAddSeconds(csecond: number): dtu;
	/** Returns a new dtu that adds the specified number of milliseconds to the value of this object. */
	DtuAddMilliseconds(cmillis: number): dtu;
	/** Returns the start of the day. */
	StartOfDay(): dtu;
	/** Returns the start of the month. */
	StartOfMonth(): dtu;
	/** Returns the start of the year. */
	StartOfYear(): dtu;
	/** Returns the day of the week: 0-6, with Sunday as 0 and Saturday as 6 */
	DayOfWeek(): number;
	/** Returns the week of the year defined by ISO 8601 */
	WeekOfYear(): number;
	/** Returns difference between dates as a timespan */
	Diff(dtuOther: dtu): timespan;
	/** Returns the date created by adding the timespan to this date */
	Add(timespan: timespan): dtu;
	/** Returns the date created by subtracting the timespan from this date */
	Subtract(timespan: timespan): dtu;
	/** Converts the value of the current dtu object to its equivalent string representation using the specified format. */
	Format(rvDtf: dtf): string;
	/** No docs */
	Year: number;
	/** No docs */
	Month: number;
	/** No docs */
	Day: number;
	/** No docs */
	Hour: number;
	/** No docs */
	Minute: number;
	/** No docs */
	Second: number;
	/** No docs */
	Millisecond: number;
}

/** Event table. Event tables can be created using the 'using eventtab foo' syntax */
class eventtable {
}
interface eventtable {
	/** Returns the list of pending events from the eventtab matching the criteria specified in the rvmapFbe parameter. Each returned event is converted to a map. */
	Read(rvmapFbe: map): list;
	/** Creates a pending event with the specified values in the eventtab. Error occurs if the table already contains an event with the same values. Error occurs if the user column is not specified or null. */
	Create(rvmapInsert: map): void;
	/** Cancels a pending event with the specified values in the table. Error occurs if rvmapWhere does not match exactlz on event */
	Cancel(rvmapWhere: map): void;
}

/** Represents an opened Excel file. */
class excel {
	/** Open an Excel file from a fileref.

Returns an excel object, representing the opened file.
The same excel file may be opened multiple times.
Throws an error if the file is not a valid XLSX file, XLS files are not supported.

Avoid opening too many Excel files at once, to conserve memory.
Use the `Close()` method to close a file after use.

All remaning opened Excel files will be closed at the end of the script execution. */
	static FromFileref(fileref: fileref): excel;
	/** Converts an excel date (represented as a number) to a Dtdb.

Sometimes the `GetValue()` method may return a number, even if the cell is formatted as a date.
This should only happen for exotic date formats.

In that case, you can use this method to convert the number returned by `GetValue()` to a `dtdb`. */
	static ExcelDateToDtdb(dateAsNumber: number): dtdb;
}
interface excel {
	/** Returns the value of the cell.

The returned value may be one of the following types:
- boolean
- number
- DtDb
- string
- null

The first valid row/column number is 0.
Formula cells return the last calculated value of the formula.
Blank cells and error cells return null.
Null is also returned if you address a cell outside the sheet's range.
Negative row/column parameters throw an error.
Referring to a non-existent sheet also throws an error. */
	GetValue(sheetName: string, row: number, column: number): any;
	/** Returns a list containing the names of the worksheets in the Excel file. */
	SheetNames(): list;
	/** Closes (frees memory used by) the excel document. */
	Close(): void;
	/** Returns the number of rows on a sheet.

Referring to a non-existent sheet also throws an error. */
	RowCount(sheetName: string): number;
	/** Returns the number of columns on a sheet.

Referring to a non-existent sheet also throws an error. */
	ColumnCount(sheetName: string): number;
}

/** File reference. */
class fileref {
	/** Create a new fileref from a mediaId (guid as a string) and a priority (int) */
	static New(mediaId: string, priority: number): fileref;
	/** Parse the fileref from a string representation, 'guid|priority' */
	static Parse(fileref: string): fileref;
}
interface fileref {
	/** Returns a boolean indicating whether the referenced file exists */
	Exists(): boolean;
	/** Returns the original filename of the file, if known. */
	Filename(): string;
	/** Returns the size of the file, or -1 if the file doesn't exist. */
	Size(): number;
	/** Returns the all-lowercase SHA-1 checksum for the file. May be null for older files (uploaded before checksums) */
	Checksum(): string;
	/** Format the fileref into its string representation, 'guid|priority' */
	ToString(): string;
	/** Get the mediaId from the fileref */
	MediaId(): string;
	/** Get the priority of the fileref */
	Priority(): number;
	/** Deletes the stored file behind fileref */
	Delete(fForced: boolean): void;
}

/** Double precision floating point value */
class floatT {
	/** Returns positive infinity. */
	PositiveInfinity(): number;
	/** Returns negative infinity. */
	NegativeInfinity(): number;
	/** Returns a value that is not a number (NaN). */
	NaN(): number;
	/** Converts the string representation of a number to its floating-point number equivalent. Returns <<undefined>> if the conversion fails. */
	Parse(st: string): number | undefined;
	/** Converts the string representation of a number to its floating-point number equivalent, returns <<undefined>> if the conversion fails. */
	ParseNuf(rvnuf: map, st: string): number | undefined;
	/** Returns a random value in the interval [0, 1) */
	Random(): number;
}
var float: floatT;

/** Globally unique identifier */
class guid {
	/** Generates a new Guid value. */
	static Generate(): guid;
	/** Converts the string representation of a GUID to the equivalent Guid value. Returns <<undefined>> if the conversion fails. */
	static Parse(st: string): guid | undefined;
}
interface guid {
	/** Returns a string representation of the value in the format of 32 digits: f8903fa1a9ed4ce5bf0f83b96413109e */
	ToStringN(): string;
	/** Returns a string representation of the value in the format of 32 digits separated by hyphens: f8903fa1-a9ed-4ce5-bf0f-83b96413109e */
	ToStringD(): string;
	/** Returns a string representation of the value in the format of 32 digits separated by hyphens, enclosed in brackets: {f8903fa1-a9ed-4ce5-bf0f-83b96413109e} */
	ToStringB(): string;
}

/** Represents an image in memory. */
class image {
	/** Load an image from a file in the media store.

JPEG and PNG images are supported, other image formats may or may not work. */
	static FromFileref(fileref: fileref): image;
}
interface image {
	/** Save the image to the media store.

The type parameter can be 'png' or 'jpg'.
Returns the mediaId of the created file. */
	Store(type: string): string;
	/** Free the memory used for storing this image.

The image won't be usable after closing. */
	Close(): void;
	/** Replaces the image with a part of it.

The x and y coordinates specify the top-left of the cropped rectangle,
and the width and height specify the size of the cropped rectangle.

The function tries hard to crop a rectangle with the specified size.
If the x/y coordinates are negative, they are increased to zero.
If the x+width/y+height values are off the image, the x and y coordinates
are decreased until this is not the case.
If the width/height are larger than the image's size, they are decreased
to match the image's width/height.

The width and height values must be positive. */
	Crop(x: number, y: number, width: number, height: number): void;
	/** Draws a shape on the image.

The `x` and `y` coordinates specify the center of the shape.

The `size` specifies the radius (or whatever is analogous) for the shape;
so the shape will take up about `size / 2` pixels around the center.

The style parameter defines details about the shape to be drawn.
It has three properties:

The `color` property may be a string containing a hex CSS color, the default is black.

The `shape` parameter specifies the kind of shape: `disk`, `square`, `triangle` or `rhombus`.
The `shape` may have an optional `full_`, `open_` or `dashed_` prefix.
The default is `full_disk`.

The `lineWidth` property defines the thickness of the outline
when the shape is prefixed with `open_` or `dashed_`. */
	DrawShape(x: number, y: number, size: number, style: map): void;
	/** Draws a polygon on the image.

The `points` parameter must be a list containing the points for the polygon.
A point must be a map/object, with `x` and `y` properties.
The list must contain at least 3 points.

The `style` parameter contains a map which specifies how to draw the polygon.
It may have these optional properties:

`shape`
One of `shape`, `dashedShape` or `cloud`.
`shape` is the default.

`lineWidth`:
The width of the line to draw.
The default is 1.

`color`:
The color must be a CSS hex color, like `#FFF` or ``AABBCC``.
Alpha components are not supported.
The default is black.

`radius`:
When `shape` is cloud, determines the radius of the arcs that the cloud is composed of.
The default is 10.

The origin of the coordinate system is at the top-left corner.
All units are pixels. */
	DrawPolygon(points: list, style: map): void;
	/** Creates a copy of this image.

Cropping and drawing changes the image.
This is useful if you want to make multiple modifications from the same source image,
like cropping the same rendered PDF page.
The cloned image needs to be closed independently from the source image. */
	Clone(): image;
	/** The width of the image, in pixels.
Contains 0 if the image is closed. */
	Width: number;
	/** The height of the image, in pixels.
Contains 0 if the image is closed. */
	Height: number;
}

/** 32-bit signed integer */
class int {
	/** Converts the string representation of a number to integer equivalent, returns <<undefined>> if the conversion fails. */
	static Parse(st: string): number | undefined;
	/** Converts the string representation of a number to integer equivalent, returns <<undefined>> if the conversion fails. */
	static ParseNuf(rvnuf: map, st: string): number | undefined;
}

/** Represents a list of values. Values can be of any type (rv). */
class list extends Array {
	/** Initializes a new list object. */
	static New(): list;
}
interface Array<T> {
	/** Initializes a new list object based this list. */
	Clone(): list;
	/** Adds an object to the end of the list. */
	Add(rvItem: any): void;
	/** Gets the number of items in the list. */
	Count(): number;
	/** Retrieves the item in the list in the specified position. The [] operator can also be used for this purpose. */
	GetAt(index: number): any;
	/** Sets the item in the list in the specified position. The [] operator can also be used for this purpose. */
	SetAt(index: number, rvItem: any): void;
	/** Removes and returns the item at the specified index. */
	RemoveAt(index: number): any;
	/** Returns the single element of the list. An error occurs if the list is empy or contains more elements. */
	Single(): any;
	/** Returns the single element of the list or <<null> if the list is empty. An error occurs if the list contains more elements. */
	SingleOrDefault(): any;
	/** Returns the contents of the list and the other list in a new list. */
	Concat(other: list): list;
}

/** Represents a list of labelled values. Values are labelled with strings. Values can be of any type (rv). */
class map {
	/** Initializes a new map object. */
	static New(): map;
}
interface Object {
	/** Initializes a new map object based this map. */
	Clone(): map;
	/** Determines whether the map contains the specified key. */
	ContainsKey(stKey: string): boolean;
	/** Gets the number of key/value pairs contained in the map. */
	Count(): number;
	/** Removes all keys and values from the map. */
	Clear(): void;
	/** Returns the value associatied with the specified key. An error occures if the key not exists in the map. The [] operator can also be used for this purpose. */
	GetAt(stKey: string): any;
	/** Associatied the specified key with the given value in the map. The [] operator can also be used for this purpose. */
	SetAt(stKey: string, rvItem: any): void;
	/** Returns the list of keys from the map. */
	Keys(): list;
	/** Returns the contents of the map and the other map in a new map. The repeated keys will use the second map's value. */
	Concat(other: map): map;
}

/** Pdf file with info. */
class pdf {
	/** Pdf from fileref */
	static FromFileref(fileref: fileref): pdf;
	/** Pdf from reportviewId */
	static FromReportviewId(reportviewId: string): pdf;
	/** Merges multiple pdf files into one report or file */
	static Merge(rvPdfs: list, outputPdfName: string, outputType: string): string;
	/** Measure the area needed to draw the specified text.

The `text` parameter specifies the size of the text to be measured. Lines are broken at spaces, and
newline characters are supported, just like with the `AddFreeTextAnnotation` method.

The `maxWidth` parameter specifies the maximum width of the text area, specified in points. Long lines
are broken up at space characters to try and not exceed `maxWidth`. If the text contains long
unbreakable words the actual measured width of the text will exceed `maxWidth`.

The `style` parameter is a map that specifies font parameters. It supports a subset of
`AddFreeTextAnnotation`'s properties:
- `fontFamily` (default: Helvetica): The name of the font to use.
- `fontSize` (default: 12): The em-size of the font in points.
- `bold`, `italic`, `underline` (default: false): Flags specifying different font styles.

The method returns a map with a `width` and a `height` key. These values specify the minimum area needed
to render the text on the PDF. */
	static MeasureText(text: string, maxWidth: number, style: map): map;
}
interface pdf {
	/** Returns a boolean indicating whether the pdf file is valid */
	IsValid(): boolean;
	/** Returns the number for pages in the pdf */
	PageCount(): number;
	/** Returns the size of each page in the pdf */
	PageSizes(): list;
	/** Renders a page of the PDF to an image.

The scale parameter specifies the resoultion of the image,
the size of the image will be `scale * size` of the page,
where the size is the width or height in `pt` units. */
	Render(pageIndex: number, scale: number): image;
	/** Adds an annotation with the specified shape.

The `x` and `y` coordinates specify the center of the shape.

The `size` specifies the radius (or whatever is analogous) for the shape;
so the shape will take up about `size / 2` pixels around the center.

The style parameter defines details about the shape to be drawn.
It has three properties:

The `color` property may be a string containing a hex CSS color, the default is black.

The `shape` parameter specifies the kind of shape: `disk`, `square`, `triangle` or `rhombus`.
The `shape` may have an optional `full_`, `open_` or `dashed_` prefix.
The default is `full_disk`.

The `lineWidth` property defines the thickness of the outline
when the shape is prefixed with `open_` or `dashed_`.

The origin of the coordinate system is at the top-left corner.
All dimensions use `pt` units. */
	AddShapeAnnotation(pageIndex: number, x: number, y: number, size: number, style: map): void;
	/** Adds a polygon annotation.

The `points` parameter must be a list containing the points for the polygon.
A point must be a map/object, with `x` and `y` properties.
The list must contain at least 3 points.

The `style` parameter contains a map which specifies how to draw the polygon.
It may have these optional properties:

`shape`
One of `shape`, `dashedShape` or `cloud`.
`shape` is the default.

`lineWidth`:
The width of the line to draw.
The default is 1.

`color`:
The color must be a CSS hex color, like `#FFF` or ``AABBCC``.
Alpha components are not supported.
The default is black.

`radius`:
When `shape` is cloud, determines the radius of the arcs that the cloud is composed of.
The default is 10.

The origin of the coordinate system is at the top-left corner.
All dimensions use `pt` units. */
	AddPolygonAnnotation(pageIndex: number, points: list, style: map): void;
	/** Closes the document, frees the memory used. */
	Close(): void;
	/** Save the PDF to the media store.

Returns the mediaId of the created file.
The `filename` parameter specifies the filename used for the media store entry.
'Document.pdf' is used if it's `null`. */
	Store(filename: string): string;
	/** Transform points from the annotator's coordinate system to a PDF page's coordinate system.

The point has to be a map/object with `x` and `y` properties.
The coordinates of the input point
1. apply to the rotated page (if the page has any rotation)
2. are in percentages of the width/height of the page
3. have an origin on the top-left of the page's cropBox

The returned coordinates:
1. apply to the non-rotated page
2. are in pt units
3. have an origin at the top-left of the page's mediaBox. */
	AnnotatorToPdfCoordinates(pageIndex: number, points: list): list;
	/** Add a text annotation to the page.

The `pageIndex` parameter select the page to modify.

The `text` parameter sets the text that should be written on the PDF. Newlines are accepted, and create
a new line. Line breaks only occur at space characters; long words may overflow if the width is too
small.

The `position` parameter sets the bounding box of the annotation, measured from the top-left of the
rotated cropbox. All units are points. The size of the bounding box includes the border.

The `style` parameter is a map containing details about how to draw the text. All properties are
optional, the defaults are listed below next to the property. The following properties can be used:

- `backgroundColor` (default: white): A hex color that specifies the backgound color to use for the bounding box.
- `borderColor` (default: black): A hex color that specifies the color of the border.
- `borderWidth` (default: 0): The width of the border in points. May be zero.
- `padding` (default: no padding): A map setting the padding inside the border of the bounding box. It
can have optional `top`, `bottom`, `left` and `right` properties.
- `fontFamily` (default: Helvetica): The name of the font to use.
- `fontSize` (default: 12): The em-size of the font in points.
- `fontColor` (default: black): The color of the font.
- `bold`, `italic`, `underline` (default: false): Flags specifying different font styles.
- `hPosition` (default: center): Specifies horizontal alignment. May be `left`, `center` or `right`.
- `vPosition` (default: center): Specifies vertical alignment. May be `top`, `center` or `bottom`.
- `grow` (default: down): Specifies how to grow the bounding box vertically if the text doesn't fit.
can be `up`, `down`, `none` or `both`. Using `none` doesn't grow the bounding box, parts of the text
may be invisible. `Both` grows the box up and down with an equal amount. */
	AddFreeTextAnnotation(pageIndex: number, text: string, position: map, style: map): void;
	/** Add an image as an annotation to the page.

The `pageIndex` parameter select the page to modify.

The `image` parameter specifies the image object to use.

The `position` parameter sets the bounding box of the image, measured from the top-left of the
rotated cropbox. All units are points. The image will be stretched to fit this area. */
	AddImageAnnotation(pageIndex: number, image: image, position: map): void;
}

/** Represents data for QR code image generation. */
class qrcode {
	/** Initializes a new qrcode object. */
	static New(): qrcode;
}
interface qrcode {
	/** Generates a QR code and returns the image. */
	Generate(): image;
	/** Sets the data contained in the QR code.

If the text is null or too long, Generate() will throw an error. */
	Text: string;
}

/** No docs */
class rfsref {
}
interface rfsref {
	/** No docs */
	New(): rfsrun;
}

/** No docs */
class rfsrun {
}
interface rfsrun {
	/** No docs */
	Run(): void;
	/** No docs */
	SetParams(rvParams: map): void;
	/** No docs */
	SetPriority(priority: string): void;
}

/** Database table. Database tables can be created using the 'using reftab foo' syntax */
class table {
}
interface table {
	/** Returns the list of rows from the table matching the criteria specified in the rvmapFbe parameter. Each returned row is converted to a map. */
	Read(rvmapFbe: map): list;
	/** Returns the list of rows from the table matching the criteria specified in the rvmapFbe parameter, mapped to given field list in second parameter. Each returned row is converted to a map. */
	ReadFields(rvmapFbe: map, rvrgFields: list): list;
	/** Updates the row specified by the rvmapWhere parameter with the values set by the rvmapSet parameter. Error occurs if rvmapWhere matches multiple rows. */
	Update(rvmapWhere: map, rvmapSet: map): void;
	/** Updates the rows specified by the rvmapWhere parameter with the values set by the rvmapSet parameter. */
	UpdateMany(rvmapWhere: map, rvmapSet: map): void;
	/** Inserts the row specified by the rvmapWhere parameter to the table.
If the row already presents, updates it with rvmapSet.
In the later case rvmapWhere should match precisely one row in the table. */
	InsertOrUpdate(rvmapWhere: map, rvmapSet: map): void;
	/** Inserts the specified row the the table. Error occurs if the table already contains the row. */
	Insert(rvmapInsert: map): void;
	/** Deletes the specified row from the table. Error occurs if rvmapWhere matches multiple rows. */
	Delete(rvmapWhere: map): void;
	/** Deletes the specified row(s) from the table. */
	DeleteMany(rvmapWhere: map): void;
	/** Locks the specified row(s) until the end of the RFS run. Throws an error if the lock cannot be acquired and returns the locked rows. */
	Lock(rvmapWhere: map): list;
}

/** Terminates the evaluation with the specified error message. Will revert database transaction, mark processing failed and move message to deadletter queue. */
function ThrowError(stMsg: string): void;
/** Adds failed assert and message log message if cond is false. */
function Assert(cond: boolean, stMsg: string): void;
/** Suspends the execution for a given time. */
function Sleep(milliseconds: number): void;
/** Returns the type of its parameter as a string. */
function TypeOf(rv: any): string;
/** Logs the parameter, same as the trace statement. */
function Log(rv: any): void;

/** Sends push notification */
function SendNotification(rvUsers: any, rvNotification: map): void;
/** Sends trigger sync notification */
function SendTriggerSync(rvUsers: any): void;

/** Smtp interface. Can send emails */
class smtp {
	/** Sends email with parameters in the map */
	static SendEmail(rvmapFbe: map): void;
}

interface String {
	/** Gets the number of characters in the current object. */
	Length(): number;
	/** Gets the character at the given index. The [] operator can also be used for this purpose. */
	GetAt(index: number): string;
	/** Retrieves a substring from this instance. The substring starts at a specified character position and has a specified length. */
	SubString(indexFirst: number, length: number): string;
	/** Reports the zero-based index of the first occurrence of the specified string in this string. */
	IndexOf(st: string): number;
	/** Reports the zero-based index of the last occurrence of the specified string in this string. */
	LastIndexOf(st: string): number;
	/** Returns a copy of this string converted to lowercase. */
	ToLower(): string;
	/** Returns a copy of this string converted to uppercase. */
	ToUpper(): string;
	/** Converts the numeric value to its equivalent string representation. */
	ToString(): string;
	/** Replaces all occurrences of the first parameter with the second. */
	Replace(stOld: string, stNew: string): string;
	/** Splits the string with given separator. Empties are removed. */
	Split(stSep: string): list;
	/** Splits the string with given separators in a list with empty ommiting option. */
	SplitOnMany(rgRtlistSep: list, fRemoveEmpties: boolean): list;
	/** Joins a list of strings given in parameter with this separator string. */
	Join(rgRtlist: list): string;
	/** Converts to urlencoded text. */
	UrlEncode(): string;
	/** Trims the given characters on both ends. */
	Trim(stChars: string): string;
	/** Trims the given characters on start. */
	TrimStart(stChars: string): string;
	/** Trims the given characters on end. */
	TrimEnd(stChars: string): string;
	/** Applies unicode normalization of given kind. */
	Normalize(stKind: string): string;
	/** Calculates the SHA-1 hash of the UTF-8 encoded representation of this string. Does not perform normalization before encoding the string. The result is 40 lowercase hex digits as a string, e.g. 'a2743f812...c3' */
	Sha1(): string;
}

/** Distance between two dtl's or dtu's.
You can create timespan by subtracting dates. Eg: dtlTo - dtlFrom
NOTE: You may not subtract dtl from dtu and vice versa. */
class timespan {
	/** Initializes a new TimeSpan to a specified number of days, hours, minutes, seconds, and milliseconds. */
	static New(days: number, hours: number, minutes: number, seconds: number, milliseconds: number): timespan;
}
interface timespan {
	/** Subtracts the provided timespan from this timespan. */
	Subtract(timespan: timespan): timespan;
	/** Adds the provided timespan from this timespan. */
	Add(timespan: timespan): timespan;
	/** No docs */
	Days: number;
	/** No docs */
	Hours: number;
	/** No docs */
	Minutes: number;
	/** No docs */
	Seconds: number;
	/** No docs */
	Milliseconds: number;
	/** No docs */
	TotalDays: number;
	/** No docs */
	TotalHours: number;
	/** No docs */
	TotalMinutes: number;
	/** No docs */
	TotalSeconds: number;
	/** No docs */
	TotalMilliseconds: number;
}

/** Tracking table. Included automatically under db. */
class tracking {
}
interface tracking {
	/** Returns the list of tracking rows matching the criteria specified in the rvmapFbe parameter. Each returned row is converted to a map. */
	Read(rvmapFbe: map): list;
	/** Returns the distance of tracking positions in meters. */
	Geodistance(rvlist: list): number;
}

interface Number {
	/** Returns a value indicating whether the specified number evaluates to a value that is not a number (NaN). */
	IsNaN(): boolean;
	/** Returns a value indicating whether the specified number evaluates to negative or positive infinity. */
	IsInfinity(): boolean;
	/** Returns a value indicating whether the specified number evaluates to negative infinity. */
	IsNegativeInfinity(): boolean;
	/** Returns a value indicating whether the specified number evaluates to positive infinity. */
	IsPositiveInfinity(): boolean;
	/** Returns the largest integer less than or equal to the specified decimal number. */
	Floor(): number;
	/** Returns the largest integer less than or equal to the specified decimal number. */
	Truncate(): number;
	/** Rounds the value to the nearest integral value. */
	Round(): number;
	/** Returns the smallest integral value that is greater than or equal to the floating-point number. */
	Ceiling(): number;
	/** Converts the numeric value to its equivalent string representation. */
	ToString(): string;
	/** Converts the numeric value to its equivalent string representation. */
	ToStringNuf(rvNuf: map): string;
	/** Converts the integer value to its equivalent floating point representation. */
	ToFloat(): number;
}

}
declare global {
	interface map {
		[x: string]: any 
	}
	interface __db_type {
		tracking: table
	}
	class __location_type {
		latitude: number
		longitude: number
		altitude: number
		accuracy: number
		dtuAcquired: dtu
	}
	class __form_type extends map {
		formn: string;
		platform: string;
		resultId: number;
		dtuSubmit: dtu;
		dtlSubmit: dtl;
		user: __user_type;
		location: __location_type;
	}
	const form: __form_type;
	const params: any;
	const dacs: any;
	class __report_input_type {
		Name: string;
		ReportviewId: string;
		AttachmentName: string;
		DtuT0: dtu;
		DtuArchive: dtu;
		ResultIdList: number[] | null;
		Params: any;
	}
	const report: __report_input_type;
	class __package_type {
		name: string;
		displayName: string;
		version: string;
	}
	class __systeminfo_type {
		systemVersion: string;
		package: string;
	}
	const systemInfo: __systeminfo_type;
	class __programInfo_type {
		engine: string;
		name: string;
		trigger: string;
		triggerType: string;
	}
	const programInfo: __programInfo_type;
	class __company_type {
		id: number
		name: string
	}
	const company: __company_type;
	class __user_type {
		id: number
		companyId: number
		name: string
	}
	class __endsync_type {
		event: map
		user: __user_type
	}
	const endsync: __endsync_type;
	class __report_start_type {
		SetPriority(priority: string): void
		Params: any
		T0: dtu
		Run(): void
	}
	class __report_ref {
		New(): __report_start_type
	}
interface __message_factory {
	New(): __message;
}

interface __message extends map {
	Packet: any;
	Send(): void;
}

interface __formref_type {
	webformUrl: string;
	Pop(usern: string, params: map): void;
}

const runtime = '<<runtime>>';
const string = '<<string>>';
interface __stackframe_type {
	file: string;
	line: number;
	column: number;
}

function GetShortStack(jsStack: string):__stackframe_type[];
}

// ---- solution dependent code starts here ---

declare global {
	class __db_type {
		"ai_scan_beosztas_form": table
		"ai_scan_company": table
		"ai_scan_delivery_note": table
		"ai_scan_delivery_note_item_job": table
		"ai_scan_delivery_note_item_qaj": table
		"ai_scan_delivery_note_job": table
		"ai_scan_delivery_note_qaj": table
		"ai_scan_job_inprogress": table
		"ai_scan_job_result": table
		"ai_scan_jobs": table
		"ai_scan_jobs_history": table
		"ai_scan_project": table
		"ai_scan_qa_job_result": table
		"ai_scan_settings": table
		"ai_scan_um_log": table
		"ai_scan_user": table
		"ai_scan_user_language": table
	}
	const db: __db_type;
}
declare global {
	class __reports_type {
	}
	const reports: __reports_type;
}
declare global {
	class __rfs_type {
		"ai_scan_agent_dashboard": rfsref
		"ai_scan_AssignAITaskResponse": rfsref
		"ai_scan_coordinator_dashboard": rfsref
		"ai_scan_DNScanUpdate": rfsref
		"ai_scan_gw_response": rfsref
		"ai_scan_NewQATask": rfsref
		"ai_scan_output": rfsref
		"ai_scan_qa_job": rfsref
		"ai_scan_send_AssignAITask": rfsref
		"ai_scan_send_QATaskDone": rfsref
		"ai_scan_setting": rfsref
		"ai_scan_uiresponse": rfsref
		"conversion": rfsref
		"tested": rfsref
	}
	const rfs: __rfs_type;
}
declare global {
	class __events_type {
	}
	const events: __events_type;
}
declare global {
	class __messages_type {
		"AITaskResult": __message_factory
		"AssignAITask": __message_factory
		"AssignAITaskResponse": __message_factory
		"DeliveryNoteOperation": __message_factory
		"DNScanUpdate": __message_factory
		"NewQATask": __message_factory
		"QATaskDone": __message_factory
		"UserIntegrationRequestDacs": __message_factory
		"UserIntegrationResponseDacs": __message_factory
	}
	const messages: __messages_type;
}
declare global {
	class __forms_type {
		"ai_scan_agent_dashboard": __formref_type
		"ai_scan_coordinator_dashboard": __formref_type
		"ai_scan_output": __formref_type
		"ai_scan_qa_job": __formref_type
		"ai_scan_setting": __formref_type
	}
	const forms: __forms_type;
}

globalThis.Log = function (rv: any) {
	console.log(rv);
}
globalThis.float={
	ParseNuf: (rvnuf: map, st: string): number | undefined => {
		return 1;
	},
		/** Returns positive infinity. */
	PositiveInfinity: ():  number => { return 1; },
		/** Returns negative infinity. */
	NegativeInfinity: (): number => { return 1; },
		/** Returns a value that is not a number (NaN). */
	NaN: (): number => { return 1; },
		/** Converts the string representation of a number to its floating-point number equivalent. Returns <<undefined>> if the conversion fails. */
	Parse: (st: string): number | undefined => { return 1; },
		/** Returns a random value in the interval [0, 1) */
	Random: (): number => { return 1; },
}
