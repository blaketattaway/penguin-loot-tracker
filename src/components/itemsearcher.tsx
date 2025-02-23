import { useEffect, useState } from "react";
import { fetchBlizzardItems } from "../services/blizzardService";
import { BlizzardItem } from "../interfaces/blizzard.interface";
import LoginModal from "./loginmodal";

const ItemSearcher = () => {
  const [query, setQuery] = useState<string>("");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [items, setItems] = useState<BlizzardItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BlizzardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastQuery, setLastQuery] = useState<string>("");

  const itemsPerPage: number = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleSearch = async () => {
    if (query.trim() !== "" && query !== lastQuery) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBlizzardItems(query);
        setItems(data.results.map((result) => result.data));
        setFilteredItems(data.results.map((result) => result.data));
        localStorage.setItem("plt-search-result", JSON.stringify(data.results.map((result) => result.data)));
        localStorage.setItem("plt-search", query);
        setCurrentPage(1);
        localStorage.setItem("plt-search-page", "1");
        setLastQuery(query);
      } catch {
        setError("Error retrieving Blizzard data.");
      }
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleTableSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    setTableSearch(searchTerm);

    if (searchTerm === "") {
      setFilteredItems(items);
    } else {

      const filtered = items.filter(
        (item) => item.name.en_US.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
      );

      setFilteredItems(filtered);

      setCurrentPage(1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      localStorage.setItem("plt-search-page", page.toString());
    }
  };

  useEffect(() => {
    const localStorageItems = localStorage.getItem("plt-search-result");
    const localStorageSearch = localStorage.getItem("plt-search");
    const localStorageSearchPage = localStorage.getItem("plt-search-page");

    if (localStorageItems) {
      setItems(JSON.parse(localStorageItems));
      setFilteredItems(JSON.parse(localStorageItems));
    }

    if (localStorageSearch) {
      setQuery(localStorageSearch);
      setLastQuery(localStorageSearch);
    }

    if (localStorageSearchPage) {
      setCurrentPage(Number(localStorageSearchPage));
    }

  }, []);

  return (
    <div className="container mt-4">
      <div className="card bg-dark text-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-center">🔍 Item Search <LoginModal/></h2>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control bg-secondary text-white"
              placeholder="Search item..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {error && <p className="text-danger text-center">{error}</p>}

          {items.length > 0 && (
            <div className="mb-3">
              <input
                type="text"
                className="form-control bg-secondary text-white"
                placeholder="Filter results..."
                value={tableSearch}
                onChange={handleTableSearch}
              />
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <a
                          href="#"
                          className="text-info"
                          data-wowhead={`item=${item.id}`}
                        >
                          {item.name.en_US}
                        </a>
                      </td>
                      <td></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemSearcher;
