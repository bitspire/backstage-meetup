import yaml from 'js-yaml';

export const convertJsonToYaml = (...jsonArray: object[]) => {
  let output = ``;
  jsonArray.forEach(json => {
    output += yaml.dump(json);
    output += `---\n`;
  });
  return output;
};
