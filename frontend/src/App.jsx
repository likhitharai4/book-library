import { useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showRegister, setShowRegister] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    status: "Available",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setBooks([]);
    setEditingBook(null);
    setMessage("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let url = `${API_URL}/api/books`;
      let method = "POST";

      if (editingBook) {
        url = `${API_URL}/api/books/${editingBook._id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Request failed");
      }

      if (editingBook) {
        setBooks(
          books.map((book) =>
            book._id === editingBook._id ? result : book
          )
        );

        setMessage("Book updated successfully!");
      } else {
        setBooks([...books, result]);
        setMessage("Book added successfully!");
      }

      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        status: "Available",
      });

      setEditingBook(null);
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong");
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);

    setFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category: book.category || "",
      status: book.status || "Available",
    });

    setMessage("");
  };

  const handleCancel = () => {
    setEditingBook(null);

    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: "",
      status: "Available",
    });

    setMessage("");
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/books/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      setBooks(books.filter((book) => book._id !== id));
      setMessage("Book deleted successfully!");
    } catch (error) {
      console.log(error);
      setMessage("Failed to delete book");
    }
  };

  const handleBorrow = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/books/${id}/borrow`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const updatedBook = await response.json();

      if (!response.ok) {
        throw new Error(updatedBook.message || "Borrow failed");
      }

      setBooks(
        books.map((book) =>
          book._id === id ? updatedBook : book
        )
      );

      setMessage("Book borrowed successfully!");
    } catch (error) {
      console.log(error);
      setMessage("Failed to borrow book");
    }
  };

  const handleReturn = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/books/${id}/return`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const updatedBook = await response.json();

      if (!response.ok) {
        throw new Error(updatedBook.message || "Return failed");
      }

      setBooks(
        books.map((book) =>
          book._id === id ? updatedBook : book
        )
      );

      setMessage("Book returned successfully!");
    } catch (error) {
      console.log(error);
      setMessage("Failed to return book");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    fetch(`${API_URL}/api/books`, {
      headers: getAuthHeaders(),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        return response.json();
      })
      .then((data) => {
        setBooks(data);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Failed to load books");
      });
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <div>
          <Register
            onRegister={() => {
              setShowRegister(false);
            }}
          />

          <button
            type="button"
            onClick={() => setShowRegister(false)}
          >
            Back to Login
          </button>
        </div>
      );
    }

    return (
      <div>
        <Login onLogin={handleLogin} />

        <button
          type="button"
          onClick={() => setShowRegister(true)}
        >
          Create New Account
        </button>
      </div>
    );
  }

  const filteredBooks = books.filter((book) => {
    const search = searchTerm.toLowerCase();

    return (
      (book.title || "").toLowerCase().includes(search) ||
      (book.author || "").toLowerCase().includes(search) ||
      (book.isbn || "").toLowerCase().includes(search) ||
      (book.category || "").toLowerCase().includes(search)
    );
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Book Library Management System
          </h1>

          <p style={styles.subtitle}>
            Manage your books in one place
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.heading}>
            {editingBook ? "Edit Book" : "Add a Book"}
          </h2>

          {message && (
            <p style={styles.message}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Book Title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="text"
              name="author"
              placeholder="Author"
              value={formData.author}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={formData.isbn}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Available">Available</option>
              <option value="Borrowed">Borrowed</option>
            </select>

            <div style={styles.buttons}>
              <button
                type="submit"
                style={styles.addButton}
              >
                {editingBook ? "Update Book" : "Add Book"}
              </button>

              {editingBook && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2 style={styles.heading}>Books</h2>

          <input
            type="text"
            placeholder="Search by title, author, ISBN, or category..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={styles.input}
          />

          {filteredBooks.length === 0 ? (
            <div style={styles.emptyCard}>
              <p>No books available.</p>
            </div>
          ) : (
            <div style={styles.bookGrid}>
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  style={styles.bookCard}
                >
                  <h3 style={styles.bookTitle}>
                    {book.title}
                  </h3>

                  <p>
                    <strong>Author:</strong> {book.author}
                  </p>

                  <p>
                    <strong>ISBN:</strong> {book.isbn}
                  </p>

                  <p>
                    <strong>Category:</strong> {book.category}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {book.status || "Available"}
                  </p>

                  <div style={styles.buttons}>
                    <button
                      type="button"
                      onClick={() => handleEdit(book)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(book._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>

                    {book.status === "Borrowed" ? (
                      <button
                        type="button"
                        onClick={() => handleReturn(book._id)}
                        style={styles.returnButton}
                      >
                        Return Book
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBorrow(book._id)}
                        style={styles.borrowButton}
                      >
                        Borrow Book
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    backgroundColor: "#1f2937",
    color: "white",
    padding: "25px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#d1d5db",
  },

  logoutButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  main: {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "0 20px",
  },

  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    marginBottom: "40px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  heading: {
    color: "#1f2937",
    marginBottom: "20px",
  },

  message: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "6px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    flexWrap: "wrap",
  },

  addButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  editButton: {
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    padding: "9px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "9px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  borrowButton: {
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    padding: "9px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  returnButton: {
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    padding: "9px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  emptyCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
  },

  bookGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  bookCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  bookTitle: {
    color: "#1f2937",
    marginTop: 0,
  },
};

export default App;