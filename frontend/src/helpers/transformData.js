export const transformData = (records, rootNode) => {
  const nodes = new Map();
  const spouseLinks = [];

  records.forEach((record) => {
    const { person, children, spouses } = record;
    if (!person || person.id === undefined || person.id === null) {
      console.error("Invalid person data", record);
      return;
    }
    // Svaka osoba ima niz spouses i children
    let nodeData = nodes.get(person.id) || {
      ...person,
      children: [],
      spouses: [],
    };
    children.forEach((child) => {
      if (child && child.id !== undefined && child.id !== null) {
        nodes.set(
          child.id,
          nodes.get(child.id) || {
            ...child,
            children: [],
            spouses: [],
            id: child.id,
          }
        );
        nodeData.children.push(child.id); // spremi child id
      }
    });
    spouses.forEach((spouse) => {
      if (spouse && spouse.id !== undefined && spouse.id !== null) {
        nodes.set(
          spouse.id,
          nodes.get(spouse.id) || {
            ...spouse,
            children: [],
            spouses: [],
            id: spouse.id,
          }
        );
        nodeData.spouses.push(spouse.id); // spremi spouse id
        spouseLinks.push({ source: person.id, target: spouse.id });
      }
    });
    nodes.set(person.id, nodeData);
  });

  return {
    root: nodes.get(rootNode.id),
    nodes: Array.from(nodes.values()),
    spouseLinks,
  };
};
