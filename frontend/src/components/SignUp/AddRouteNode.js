import { useHistory } from "react-router-dom";

function SignUpForm() {
  const history = useHistory();

  const handleSignUpSuccess = (userData) => {
    // Assuming userData contains the user ID or a token
    history.push(`/add-root-node/${userData.userId}`); // Redirect to add root node page
  };

  // Your existing sign-up logic...
}

function AddRootNodeForm({ match }) {
  const userId = match.params.userId;

  // Form logic to handle root node creation
}
