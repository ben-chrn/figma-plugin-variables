import {
  aliasColorDLS,
  aliasColorBranch,
  aliasColorFamily,
  aliasColorCategory,
  aliasColorType,
  aliasColorComponents,
  aliasColorModifier,
  aliasColorState,
  coreColorDLS,
  coreColorFamily,
  coreColorCategory,
  coreColorType,
  coreColorModifier,
  coreColorScale,
  coreSpacingDLS,
  coreSpacingBranch,
  coreSpacingFamily,
  coreSpacingScale,
  aliasSpacingDLS,
  aliasSpacingBranch,
  aliasSpacingFamily,
  aliasSpacingCategory,
  aliasSpacingType,
  aliasSpacingComponents,
  aliasSpacingModifier,
  coreRadiusDLS,
  coreRadiusBranch,
  coreRadiusFamily,
  coreRadiusScale,
  aliasRadiusDLS,
  aliasRadiusBranch,
  aliasRadiusFamily,
  aliasRadiusCategory,
  aliasRadiusType,
  aliasRadiusComponents,
  aliasRadiusModifier,
  aliasRadiusState,
} from "../BNP_Tokens/naming-components";

function smartLocate(results: string[], stringToReplace: string) {
  if (results.length === 1) return results[0];
  else if (results.length > 1) {
    const match = results.reduce((a, b) => {
      return a.length > b.length ? a : b;
    });
    return match;
  }

  return "";
}

export function renameAliasColorStructure(tokenName: string): string {
  let tempString = tokenName;

  const DLS = aliasColorDLS.filter((v) => tempString.includes(v));
  const DLSString = smartLocate(DLS, tempString);
  tempString = tempString.replace(DLSString, "");

  const branch = aliasColorBranch.filter((v) => tempString.includes(v));
  const branchString = smartLocate(branch, tempString);
  tempString = tempString.replace(branchString, "");

  const family = aliasColorFamily.filter((v) => tempString.includes(v));
  const familyString = smartLocate(family, tempString);
  tempString = tempString.replace(familyString, "");

  const category = aliasColorCategory.filter((v) => tempString.includes(v));
  const categoryString = smartLocate(category, tempString);
  tempString = tempString.replace(categoryString, "");

  const type = aliasColorType.filter((v) => tempString.includes(v));
  const typeString = smartLocate(type, tempString);
  tempString = tempString.replace(typeString, "");

  const components = aliasColorComponents.filter((v) => tempString.includes(v));
  const componentsString = smartLocate(components, tempString);
  tempString = tempString.replace(componentsString, "");

  const modifier = aliasColorModifier.filter((v) => tempString.includes(v));
  const modifierString = smartLocate(modifier, tempString);
  tempString = tempString.replace(modifierString, "");

  const state = aliasColorState.filter((v) => tempString.includes(v));
  const stateString = smartLocate(state, tempString);
  tempString = tempString.replace(stateString, "");

  const finalNameArray = [
    // DLSString,
    branchString,
    componentsString,
    categoryString,
    typeString,
    modifierString,
    stateString,
  ];

  let finalName = "";

  for (const component of finalNameArray) {
    if (component.length > 0) {
      finalName = finalName.concat(component, "/");
    }
  }

  finalName = finalName.slice(0, -1);
  //   const finalName = `${DLSString}/${branchString}/${familyString}/${categoryString}/${typeString}/${componentsString}/${modifierString}/${state}`;
  return finalName;
}

export function renameCoreColorStructure(tokenName: string): string {
  let tempString = tokenName;

  const DLS = coreColorDLS.filter((v) => tempString.includes(v));
  const DLSString = smartLocate(DLS, tempString);
  tempString = tempString.replace(DLSString, "");

  const family = coreColorFamily.filter((v) => tempString.includes(v));
  const familyString = smartLocate(family, tempString);
  tempString = tempString.replace(familyString, "");

  const category = coreColorCategory.filter((v) => tempString.includes(v));
  const categoryString = smartLocate(category, tempString);
  tempString = tempString.replace(categoryString, "");

  const type = coreColorType.filter((v) => tempString.includes(v));
  const typeString = smartLocate(type, tempString);
  tempString = tempString.replace(typeString, "");

  const modifier = coreColorModifier.filter((v) => tempString.includes(v));
  const modifierString = smartLocate(modifier, tempString);
  tempString = tempString.replace(modifierString, "");

  const scale = coreColorScale.filter((v) => tempString.includes(v));
  const scaleString = smartLocate(scale, tempString);
  tempString = tempString.replace(scaleString, "");

  const finalNameArray = [
    categoryString,
    typeString,
    modifierString,
    scaleString,
  ];

  let finalName = "";

  for (const component of finalNameArray) {
    if (component.length > 0) {
      finalName = finalName.concat(component, "/");
    }
  }

  finalName = finalName.slice(0, -1);
  //   const finalName = `${DLSString}/${branchString}/${familyString}/${categoryString}/${typeString}/${componentsString}/${modifierString}/${state}`;
  return finalName;
}

export function renameCoreSpacingStructure(tokenName: string): string {
  let tempString = tokenName;

  const DLS = coreSpacingDLS.filter((v) => tempString.includes(v));
  const DLSString = smartLocate(DLS, tempString);
  tempString = tempString.replace(DLSString, "");

  const branch = coreSpacingBranch.filter((v) => tempString.includes(v));
  const branchString = smartLocate(branch, tempString);
  tempString = tempString.replace(branchString, "");

  const family = coreSpacingFamily.filter((v) => tempString.includes(v));
  const familyString = smartLocate(family, tempString);
  tempString = tempString.replace(familyString, "");

  const scale = coreSpacingScale.filter((v) => tempString.includes(v));
  const scaleString = smartLocate(scale, tempString);
  tempString = tempString.replace(scaleString, "");

  const finalNameArray = [familyString, scaleString];

  let finalName = "";

  for (const component of finalNameArray) {
    if (component.length > 0) {
      finalName = finalName.concat(component, "/");
    }
  }

  finalName = finalName.slice(0, -1);
  return finalName;
}

export function renameAliasSpacingStructure(tokenName: string): string {
  let tempString = tokenName;

  const DLS = aliasSpacingDLS.filter((v) => tempString.includes(v));
  const DLSString = smartLocate(DLS, tempString);
  tempString = tempString.replace(DLSString, "");

  const branch = aliasSpacingBranch.filter((v) => tempString.includes(v));
  const branchString = smartLocate(branch, tempString);
  tempString = tempString.replace(branchString, "");

  const family = aliasSpacingFamily.filter((v) => tempString.includes(v));
  const familyString = smartLocate(family, tempString);
  tempString = tempString.replace(familyString, "");

  const category = aliasSpacingCategory.filter((v) => tempString.includes(v));
  const categoryString = smartLocate(category, tempString);
  tempString = tempString.replace(categoryString, "");

  const type = aliasSpacingType.filter((v) => tempString.includes(v));
  const typeString = smartLocate(type, tempString);
  tempString = tempString.replace(typeString, "");

  const components = aliasSpacingComponents.filter((v) =>
    tempString.includes(v)
  );
  const componentsString = smartLocate(components, tempString);
  tempString = tempString.replace(componentsString, "");

  const modifier = aliasSpacingModifier.filter((v) => tempString.includes(v));
  const modifierString = smartLocate(modifier, tempString);
  tempString = tempString.replace(modifierString, "");

  const finalNameArray = [
    // DLSString,
    branchString,
    componentsString,
    categoryString,
    typeString,
    modifierString,
  ];

  let finalName = "";

  for (const component of finalNameArray) {
    if (component.length > 0) {
      finalName = finalName.concat(component, "/");
    }
  }

  finalName = finalName.slice(0, -1);
  //   const finalName = `${DLSString}/${branchString}/${familyString}/${categoryString}/${typeString}/${componentsString}/${modifierString}/${state}`;
  return finalName;
}

export function renameCoreRadiusStructure(tokenName: string): string {
  let tempString = tokenName;

  const DLS = coreRadiusDLS.filter((v) => tempString.includes(v));
  const DLSString = smartLocate(DLS, tempString);
  tempString = tempString.replace(DLSString, "");

  const branch = coreRadiusBranch.filter((v) => tempString.includes(v));
  const branchString = smartLocate(branch, tempString);
  tempString = tempString.replace(branchString, "");

  const family = coreRadiusFamily.filter((v) => tempString.includes(v));
  const familyString = smartLocate(family, tempString);
  tempString = tempString.replace(familyString, "");

  const scale = coreRadiusScale.filter((v) => tempString.includes(v));
  const scaleString = smartLocate(scale, tempString);
  tempString = tempString.replace(scaleString, "");

  const finalNameArray = [familyString, scaleString];

  let finalName = "";

  for (const component of finalNameArray) {
    if (component.length > 0) {
      finalName = finalName.concat(component, "/");
    }
  }

  finalName = finalName.slice(0, -1);
  //   const finalName = `${DLSString}/${branchString}/${familyString}/${categoryString}/${typeString}/${componentsString}/${modifierString}/${state}`;
  return finalName;
}

export function renameAliasRadiusStructure(tokenName: string): string {
  let tempString = tokenName;

  const DLS = aliasRadiusDLS.filter((v) => tempString.includes(v));
  const DLSString = smartLocate(DLS, tempString);
  tempString = tempString.replace(DLSString, "");

  const branch = aliasRadiusBranch.filter((v) => tempString.includes(v));
  const branchString = smartLocate(branch, tempString);
  tempString = tempString.replace(branchString, "");

  const family = aliasRadiusFamily.filter((v) => tempString.includes(v));
  const familyString = smartLocate(family, tempString);
  tempString = tempString.replace(familyString, "");

  const category = aliasRadiusCategory.filter((v) => tempString.includes(v));
  const categoryString = smartLocate(category, tempString);
  tempString = tempString.replace(categoryString, "");

  const type = aliasRadiusType.filter((v) => tempString.includes(v));
  const typeString = smartLocate(type, tempString);
  tempString = tempString.replace(typeString, "");

  const components = aliasRadiusComponents.filter((v) =>
    tempString.includes(v)
  );
  const componentsString = smartLocate(components, tempString);
  tempString = tempString.replace(componentsString, "");

  const modifier = aliasRadiusModifier.filter((v) => tempString.includes(v));
  const modifierString = smartLocate(modifier, tempString);
  tempString = tempString.replace(modifierString, "");

  const state = aliasRadiusState.filter((v) => tempString.includes(v));
  const stateString = smartLocate(state, tempString);
  tempString = tempString.replace(stateString, "");

  const finalNameArray = [
    // DLSString,
    branchString,
    // familyString,
    componentsString,
    categoryString,
    typeString,
    modifierString,
    stateString,
  ];

  let finalName = "";

  for (const component of finalNameArray) {
    if (component.length > 0) {
      finalName = finalName.concat(component, "/");
    }
  }

  finalName = finalName.slice(0, -1);
  //   const finalName = `${DLSString}/${branchString}/${familyString}/${categoryString}/${typeString}/${componentsString}/${modifierString}/${state}`;
  return finalName;
}
