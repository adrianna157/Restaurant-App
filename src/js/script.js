/**
 * Author: Adrianna Guevarra
 * Course: ICT 4510
 * Date: 7/25/2024
 * Description: This script handles the login functionality by sending a POST request to the server with the username
 * and password, saves the user object to sessionStorage upon successful login, and uses the API key for creating,
 * updating, and deleting menu items.
 */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const logoutButton = document.createElement("button");
    const menuFormCard = document.getElementById("menuFormCard");
    const menuForm = document.getElementById("menuForm");
    const menuItemsCard = document.getElementById("menuItemsCard");
    const menuItemsList = document.getElementById("menuItemsList");
  
    logoutButton.textContent = "Logout";
    logoutButton.classList.add("btn", "btn-secondary", "btn-block", "mt-3");
    logoutButton.style.display = "none";
    document.querySelector(".card-body").appendChild(logoutButton);
  
    let user = JSON.parse(sessionStorage.getItem("user"));
  
    if (user) {
      showUserContent(user);
      fetchMenuItems(user.api_key); // Fetch menu items using stored API key
    }
  
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      try {
        const response = await fetch("https://ict4510.herokuapp.com/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        });
  
        if (response.ok) {
          const res = await response.json();
          sessionStorage.setItem("user", JSON.stringify(res.user));
          user = res.user;
          showUserContent(user);
          fetchMenuItems(user.api_key);
        } else {
          alert(
            "Login failed. Your login credentials are incorrect. Please try again."
          );
        }
      } catch (error) {
        console.error("Error during login:", error.message, error.stack);
        alert("An error occurred. Please contact your administrator.");
      }
    });
  
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem("user");
      loginForm.style.display = "block";
      welcomeMessage.style.display = "none";
      logoutButton.style.display = "none";
      menuFormCard.style.display = "none";
      menuItemsCard.style.display = "none";
      menuItemsList.innerHTML = "";
    });
  
    menuForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const item = document.getElementById("item").value;
      const description = document.getElementById("description").value;
      const price = document.getElementById("price").value;
  
      try {
        const response = await fetch(
          `https://ict4510.herokuapp.com/api/menus?api_key=${user.api_key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": user.session_token
            },
            body: JSON.stringify({ item, description, price })
          }
        );
  
        if (response.ok) {
          alert("Menu item added successfully.");
          menuForm.reset();
          fetchMenuItems(user.api_key); // Fetch updated menu items after adding a new one
        } else {
          const errorData = await response.json();
          alert(`Failed to add menu item: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error adding menu item:", error.message, error.stack);
        alert(
          "An error occurred while adding the menu item. Please contact your administrator."
        );
      }
    });
  
    async function fetchMenuItems(apiKey) {
      try {
        const response = await fetch(
          `https://ict4510.herokuapp.com/api/menus?api_key=${apiKey}`,
          {
            headers: {
              "x-access-token": user.session_token
            }
          }
        );
  
        if (response.ok) {
          const data = await response.json(); // Change `items` to `data`
          console.log("Fetched items:", data); // Log the fetched items for debugging
  
          const items = data.menu; // Access the `menu` property from the response object
  
          menuItemsList.innerHTML = ""; // Clear existing items
  
          // Check if items is an array
          if (Array.isArray(items) && items.length > 0) {
            items.forEach((item) => {
              const listItem = document.createElement("li");
              listItem.classList.add("list-group-item");
              listItem.textContent = `${item.item} - ${item.description} - $${item.price}`;
  
              // Create Edit and Delete buttons
              const editButton = document.createElement("button");
              editButton.textContent = "Edit";
              editButton.classList.add("btn", "btn-warning", "btn-sm", "ml-2");
              editButton.onclick = () => editMenuItem(item.id, item);
  
              const deleteButton = document.createElement("button");
              deleteButton.textContent = "Delete";
              deleteButton.classList.add("btn", "btn-danger", "btn-sm", "ml-2");
              deleteButton.onclick = () => deleteMenuItem(item.id);
  
              listItem.appendChild(editButton);
              listItem.appendChild(deleteButton);
              menuItemsList.appendChild(listItem);
            });
            menuItemsCard.style.display = "block";
          } else {
            // If items is not an array or is empty, display a message
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.textContent = "No menu items available.";
            menuItemsList.appendChild(listItem);
            menuItemsCard.style.display = "block";
          }
        } else {
          const errorData = await response.json();
          console.error("Error response from server:", errorData);
          alert(`Failed to load menu items: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error.message, error.stack);
        alert(
          "An error occurred while fetching menu items. Please check your network connection and try again."
        );
      }
    }
  
    async function editMenuItem(itemId, item) {
      const newItem = prompt("Enter new item name", item.item);
      const newDescription = prompt("Enter new description", item.description);
      const newPrice = prompt("Enter new price", item.price);
  
      if (newItem && newDescription && newPrice) {
        try {
          const response = await fetch(
            `https://ict4510.herokuapp.com/api/menus?api_key=${user.api_key}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": user.session_token
              },
              body: JSON.stringify({
                id: itemId.toString(), // Convert itemId to a string
                item: newItem,
                description: newDescription,
                price: newPrice
              })
            }
          );
  
          if (response.ok) {
            alert("Menu item updated successfully.");
            fetchMenuItems(user.api_key); // Refresh menu items
          } else {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            alert(`Failed to update menu item: ${errorData.message}`);
          }
        } catch (error) {
          console.error("Error updating menu item:", error.message, error.stack);
          alert(
            "An error occurred while updating the menu item. Please contact your administrator."
          );
        }
      }
    }
  
    async function deleteMenuItem(itemId) {
      if (confirm("Are you sure you want to delete this menu item?")) {
        try {
          const response = await fetch(
            `https://ict4510.herokuapp.com/api/menus?api_key=${user.api_key}&id=${itemId}`,
            {
              method: "DELETE",
              headers: {
                "x-access-token": user.session_token
              }
            }
          );
  
          if (response.ok) {
            alert("Menu item deleted successfully.");
            fetchMenuItems(user.api_key); // Refresh menu items
          } else {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            alert(`Failed to delete menu item: ${errorData.message}`);
          }
        } catch (error) {
          console.error("Error deleting menu item:", error.message, error.stack);
          alert(
            "An error occurred while deleting the menu item. Please contact your administrator."
          );
        }
      }
    }
  
    function showUserContent(user) {
      loginForm.style.display = "none";
      welcomeMessage.style.display = "block";
      welcomeMessage.textContent = `Welcome, ${user.first_name} ${user.last_name}!`;
      logoutButton.style.display = "block";
      menuFormCard.style.display = "block";
    }
  });
  