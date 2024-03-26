// TreeNode component represents a single node in the tree
const TreeNode = ({ data }) => {
    return (
      <div>
        <div>{data.name}</div>
        {data.children && (
          <ul>
            {data.children.map(child => (
              <li key={child.id}>
                <TreeNode data={child} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  // Tree component represents the entire tree
  const Tree = ({ data }) => {
    return (
      <div>
        <h2>Family Tree</h2>
        <TreeNode data={data} />
      </div>
    );
  };
  
  // Example data for testing
  const treeData = {
    id: 1,
    name: "Parent",
    children: [
      {
        id: 2,
        name: "Child 1",
        children: [
          {
            id: 4,
            name: "Grandchild 1", 
            children: []
          },
          {
            id: 5,
            name: "Grandchild 2",
            children: []
          }
        ]
      },
      {
        id: 3,
        name: "Child 2",
        children: []
      }
    ]
  };
  
  // Usage example
  const FamTree = () => {
    return <Tree data={treeData} />;
  };
  
  export default FamTree;
  