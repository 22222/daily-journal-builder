// import React from "react";
// import type { LengthValue } from "./LengthValue";
// import { convertLengthValueToPxOrUndefined } from "./LengthValue";
// import { IconBgColor, IconFontColor, IconSquare } from "./icons";
// import { Editor } from "./rich-text-editor/Editor";
// import type { EditorState } from "./rich-text-editor/useEditor";
// import { DropDown, DropDownItem } from "./ui/DropDown";
// import { DropdownColorPicker } from "./ui/DropdownColorPicker";
// import { FontFamilyDropDown } from "./text-box-editor/FontFamilyDropDown";
// import { FontSizeInput } from "./text-box-editor/FontSizeInput";
// import { OptionalText } from "./ui/OptionalText";
// import type { TextBoxStyle } from "./TextBoxData";
// import type { FontFace } from "./fonts/FontFace";

// export interface TextBoxEditorProps {
//   textBoxStyle: TextBoxStyle;
//   setTextBoxStyle: (newStyle: TextBoxStyle) => void;
//   pageWidth: LengthValue;
//   fonts: FontFace[];
// }

// export function TextBoxEditor({ textBoxStyle, setTextBoxStyle, pageWidth, fonts }: TextBoxEditorProps) {
//   // const [textBoxStyle, setTextBoxStyle] = React.useState<TextBoxStyle>({
//   //   fontFamily: FONT_FAMILY_OPTIONS[0][0],
//   //   fontSize: "12pt",
//   //   width: convertWidthTypeToLengthValue("50%", convertLengthValueToPxOrUndefined(pageWidth)),
//   //   minHeight: convertWidthTypeToLengthValue("10%", convertLengthValueToPxOrUndefined(pageWidth)),
//   //   color: "#000000",
//   //   backgroundColor: "#ffffff",
//   //   paddingLeft: 8,
//   //   paddingBottom: 8,
//   //   paddingRight: 8,
//   //   paddingTop: 8,
//   // });

//   //   const {
//   //     borderColor,
//   //     borderRadius,
//   //     borderStyle,
//   //     borderWidth,
//   //     paddingBottom,
//   //     paddingLeft,
//   //     paddingRight,
//   //     paddingTop,
//   //     ...contentEditableStyle
//   //   } = textBoxStyle;

//   return (
//     <div className="d-flex flex-column gap-3">
//       <TextBoxToolbar
//         textBoxStyle={textBoxStyle}
//         setTextBoxStyle={setTextBoxStyle}
//         pageWidth={pageWidth}
//         fonts={fonts}
//       />
//       <div
//         className="editor-shell"
//         style={
//           {
//             //fontSize: "15px",
//             // borderColor,
//             // borderRadius,
//             // borderStyle,
//             // borderWidth,
//             // paddingBottom,
//             // paddingLeft,
//             // paddingRight,
//             // paddingTop,
//             //padding: "8px 8px 40px",
//             //minHeight: "150px",
//           }
//         }
//         // style={{
//         //   margin: "20px auto",
//         //   borderRadius: "2px",
//         //   maxWidth: "1100px",
//         //   color: "#000",
//         //   position: "relative",
//         //   lineHeight: "1.7",
//         //   fontWeight: "400",
//         // }}
//       >
//         <Editor
//           contentEditableStyle={{
//             //border: "0",
//             //   fontSize: "15px",
//             //   display: "block",
//             position: "relative",
//             outline: "0",
//             //   padding: "8px 8px 40px",
//             border: "1px dotted #ccc",
//             minHeight: "100px",
//             ...textBoxStyle,
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// interface TextBoxToolbarProps {
//   textBoxStyle: TextBoxStyle;
//   setTextBoxStyle: (newStyle: TextBoxStyle) => void;
//   pageWidth: LengthValue;
//   fonts: FontFace[];
// }

// const FONT_FAMILY_PREFIX = "";
// const DEFAULT_FONT_FAMILY_OPTIONS: Array<{ value: string; label?: string }> = [
//   { value: "Helvetica" },
//   { value: "Times" },
//   { value: "Courier" },
// ];

// function TextBoxToolbar({ textBoxStyle, setTextBoxStyle, pageWidth, fonts }: TextBoxToolbarProps) {
//   const pageWidthPx = React.useMemo(() => convertLengthValueToPxOrUndefined(pageWidth), [pageWidth]);
//   const widthType = React.useMemo(
//     () => convertLengthValueToWidthType(textBoxStyle.width, pageWidthPx),
//     [textBoxStyle.width, pageWidthPx],
//   );

//   const fontFamilyOptions = React.useMemo(() => {
//     const options: Array<{ value: string; label?: string }> = [];
//     const fontFamilySet = new Set<string>();
//     for (const font of fonts) {
//       if (fontFamilySet.has(font.fontFamily)) {
//         continue;
//       }

//       options.push({
//         value: FONT_FAMILY_PREFIX + font.fontFamily,
//         label: font.fontFamilyDisplayName ?? font.fontFamily,
//       });
//       fontFamilySet.add(font.fontFamily);
//     }
//     if (options.length === 0) {
//       options.push(...DEFAULT_FONT_FAMILY_OPTIONS);
//     }
//     return options;
//   }, fonts);

//   const handleChangeWidth = (value: WidthType) => {
//     const width = convertWidthTypeToLengthValue(value, pageWidthPx);
//     if (textBoxStyle.width === width) {
//       return;
//     }
//     const newStyle: TextBoxStyle = { ...textBoxStyle, width: width };
//     setTextBoxStyle(newStyle);
//   };
//   const handleChangeFontFamily = (value: string) => {
//     if (textBoxStyle.fontFamily === value) {
//       return;
//     }
//     const newStyle: TextBoxStyle = { ...textBoxStyle, fontFamily: value };
//     setTextBoxStyle(newStyle);
//   };
//   const handleChangeFontSize = (value: string | undefined) => {
//     if (textBoxStyle.fontSize === value) {
//       return;
//     }
//     const newStyle: TextBoxStyle = { ...textBoxStyle, fontSize: value };
//     setTextBoxStyle(newStyle);
//   };
//   const handleChangeFontColor = (value: string) => {
//     if (textBoxStyle.color === value) {
//       return;
//     }
//     const newStyle: TextBoxStyle = { ...textBoxStyle, color: value };
//     setTextBoxStyle(newStyle);
//   };
//   const handleChangeBackgroundColor = (value: string) => {
//     if (textBoxStyle.backgroundColor === value) {
//       return;
//     }
//     const newStyle: TextBoxStyle = { ...textBoxStyle, backgroundColor: value };
//     setTextBoxStyle(newStyle);
//   };

//   return (
//     <div className="btn-toolbar gap-1">
//       <div className="btn-group">
//         <WidthDropdown value={widthType} onChange={handleChangeWidth} />
//       </div>
//       <div className="btn-group">
//         <FontFamilyDropDown
//           options={fontFamilyOptions}
//           value={textBoxStyle.fontFamily ?? ""}
//           onClick={handleChangeFontFamily}
//         />
//       </div>
//       <div className="btn-group">
//         <FontSizeInput value={textBoxStyle.fontSize} onChange={handleChangeFontSize} />
//       </div>
//       <div className="btn-group">
//         <div className="btn-group">
//           <DropdownColorPicker
//             buttonAriaLabel="Text color"
//             buttonIcon={<IconFontColor />}
//             color={textBoxStyle.color ?? ""}
//             onChange={handleChangeFontColor}
//             title="Text color"
//           />
//         </div>
//         <div className="btn-group">
//           <DropdownColorPicker
//             buttonAriaLabel="Background color"
//             buttonIcon={<IconBgColor />}
//             color={textBoxStyle.backgroundColor ?? ""}
//             colorType="background"
//             onChange={handleChangeBackgroundColor}
//             title="Background color"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// type WidthType = "25%" | "50%" | "75%" | "100%";

// const WIDTH_OPTIONS: {
//   [key in WidthType]: {
//     icon: React.ReactElement;
//     name: string;
//   };
// } = {
//   ["25%"]: {
//     icon: <IconSquare />,
//     name: "25%",
//   },
//   ["50%"]: {
//     icon: <IconSquare aspectRatio="2:1" />,
//     name: "50%",
//   },
//   ["75%"]: {
//     icon: <IconSquare aspectRatio="3:1" />,
//     name: "75%",
//   },
//   ["100%"]: {
//     icon: <IconSquare aspectRatio="4:1" />,
//     name: "100%",
//   },
// };

// function WidthDropdown({
//   value,
//   onChange,
//   disabled = false,
// }: {
//   value: WidthType | undefined;
//   onChange: (newValue: WidthType) => void;
//   disabled?: boolean;
// }) {
//   if (!value) {
//     value = "50%";
//   }
//   const option = WIDTH_OPTIONS[value];

//   return (
//     <DropDown disabled={disabled} buttonLabel={option.name} buttonIcon={option.icon} buttonAriaLabel="Width">
//       {Object.keys(WIDTH_OPTIONS).map((widthString) => {
//         const width = widthString as WidthType;
//         const option = WIDTH_OPTIONS[width];
//         return (
//           <DropDownItem key={width} onClick={onChange.bind(undefined, width)} active={value === width}>
//             {option.icon} <OptionalText>{option.name}</OptionalText>
//           </DropDownItem>
//         );
//       })}
//     </DropDown>
//   );
// }

// // type AspectRatioType = "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:1";

// // const ASPECT_RATIO_OPTIONS: {
// //   [key in AspectRatioType]: {
// //     icon: React.ReactElement;
// //     name: string;
// //   };
// // } = {
// //   ["1:1"]: {
// //     icon: <IconSquare />,
// //     name: "Square",
// //   },
// //   ["4:3"]: {
// //     icon: <IconSquare aspectRatio="4:3" />,
// //     name: "Portrait",
// //   },
// //   ["3:4"]: {
// //     icon: <IconSquare aspectRatio="3:4" />,
// //     name: "Landscape",
// //   },
// //   ["16:9"]: {
// //     icon: <IconSquare aspectRatio="16:9" />,
// //     name: "Wide",
// //   },
// //   ["9:16"]: {
// //     icon: <IconSquare aspectRatio="9:16" />,
// //     name: "Tall",
// //   },
// //   ["3:1"]: {
// //     icon: <IconSquare aspectRatio="3:1" />,
// //     name: "Very Wide",
// //   },
// // };

// // function AspectRatioDropdown({
// //   value,
// //   onChange,
// //   disabled = false,
// // }: {
// //   value: AspectRatioType;
// //   onChange: (newValue: AspectRatioType) => void;
// //   disabled?: boolean;
// // }) {
// //   if (!value) {
// //     value = "1:1";
// //   }
// //   const option = ASPECT_RATIO_OPTIONS[value];

// //   return (
// //     <DropDown disabled={disabled} buttonLabel={option.name} buttonIcon={option.icon} buttonAriaLabel="Aspect ratio">
// //       {Object.keys(ASPECT_RATIO_OPTIONS).map((aspectRatioString) => {
// //         const aspectRatio = aspectRatioString as AspectRatioType;
// //         const option = ASPECT_RATIO_OPTIONS[aspectRatio];
// //         return (
// //           <DropDownItem
// //             key={aspectRatio}
// //             onClick={onChange.bind(undefined, aspectRatio)}
// //             active={value === aspectRatio}
// //           >
// //             {option.icon} <OptionalText>{option.name}</OptionalText>
// //           </DropDownItem>
// //         );
// //       })}
// //     </DropDown>
// //   );
// // }

// export function convertWidthTypeToLengthValue(
//   widthType: WidthType | `${number}%` | undefined,
//   pageWidthPx: number | undefined,
// ): LengthValue | undefined {
//   if (typeof widthType !== "string") {
//     return undefined;
//   }
//   //const pageWidthPx = convertLengthValueToPxOrUndefined(pageWidthPx);
//   if (!pageWidthPx) {
//     return undefined;
//   }

//   const percentMatch = widthType.trim().match(/^([0-9.]+)%$/i);
//   if (!percentMatch) {
//     return undefined;
//   }

//   const percent = parseInt(percentMatch[1], 10) / 100;
//   const width = (pageWidthPx * percent) | 0;
//   return width;
// }

// function convertLengthValueToWidthType(width: unknown, pageWidthPx: number | undefined): WidthType | undefined {
//   const widthPx = convertLengthValueToPxOrUndefined(width);
//   //const pageWidthPx = convertLengthValueToPxOrUndefined(pageWidthPx);
//   if (!widthPx || !pageWidthPx) {
//     return undefined;
//   }

//   const percent = widthPx / pageWidthPx;
//   const roundedPercent = Math.round(percent * 4) / 4;
//   let widthType: WidthType;
//   if (roundedPercent <= 0.26) {
//     widthType = "25%";
//   } else if (roundedPercent <= 0.51) {
//     widthType = "50%";
//   } else if (roundedPercent <= 0.76) {
//     widthType = "75%";
//   } else {
//     widthType = "100%";
//   }
//   return widthType;
// }

// // function parseWidthTypePercent(value: WidthType | null | undefined): number | undefined {
// //   if (typeof value !== "string") {
// //     return undefined;
// //   }

// //   const match = value.trim().match(/^([0-9.]+)%$/i);
// //   if (!match) {
// //     return undefined;
// //   }

// //   return parseInt(match[1], 10);
// // }

// // Boostrap spacing levels:
// // 1 = .25rem, 2 = .5rem, 3 = 1rem, 4 = 1.5rem, 5 = 3rem
// // 1 = 4px, 2 = 8px, 3 = 16px, 4 = 24px, 5 = 48px
