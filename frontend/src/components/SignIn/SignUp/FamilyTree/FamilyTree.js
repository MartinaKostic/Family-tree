import React from 'react';
import {useReadCypher} from 'use-neo4j';

const FamilyTree = () => {
  const { first, loading, error, records } = useReadCypher(`
    MATCH (p:Person)-[:PARENT_OF]->(c:Person)
    RETURN p.name AS parent, collect(c.name) AS children
  `);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  //const susan= first?.get('parent');

 // Initialize an object to store parents and their children
 const parentChildrenMap = {};

 // Loop through each record
 records.forEach((record) => {
  const parent = record.get('parent');
  const children = record.get('children');

  // If the parent is not already in the map, add it
  //empty array to later add children
  if (!parentChildrenMap[parent]) {
    parentChildrenMap[parent] = [];
  }

  // Filter out children already present in the map
  const newChildren = children.filter((child) => !parentChildrenMap[parent].includes(child));

  // Add the new children to the parent's children list
  parentChildrenMap[parent].push(...newChildren);
});
  return (
    <div> 
     {/* Loop through parentChildrenMap to render parents and their children */}
     {/* Object.entries() is a built-in JavaScript method that returns an array of a given object's own enumerable string-keyed property [key, value] pairs. */}
     {Object.entries(parentChildrenMap).map(([parent, children]) => (
        <div key={parent}>
          <h2>Parent: {parent}</h2>
          <ul>
            {children.map((child) => (
              <li key={child}>Child: {child}</li>
            ))}
          </ul>
        </div>
      ))}
      
    </div>
  );
};

export default FamilyTree;
