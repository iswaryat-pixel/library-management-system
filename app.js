var app = angular.module("libraryApp", []);
app.factory("BookFactory", function ($http) {
  var api = "http://localhost:3000/books";
  return {
    getBooks: function () { return $http.get(api); },
    addBook: function (book) { return $http.post(api, book); },
    updateBook: function (id, book) { return $http.put(api + "/" + id, book); },
    deleteBook: function (id) { return $http.delete(api + "/" + id); }
  };
});
app.controller("LibraryController", function ($scope, BookFactory) {
  $scope.isLoggedIn = false;
  $scope.loginData = { username: "", password: "" };
  $scope.loginError = ""; $scope.books = []; $scope.book = { status: "Available" };
  $scope.editing = false; $scope.loading = false; $scope.message = ""; $scope.error = ""; $scope.searchText = "";
  $scope.login = function () {
    if ($scope.loginData.username === "admin" && $scope.loginData.password === "admin123") {
      $scope.isLoggedIn = true; $scope.loginError = ""; $scope.loadBooks();
    } else { $scope.loginError = "Invalid username or password."; }
  };
  $scope.logout = function () { $scope.isLoggedIn = false; $scope.loginData = {username:"",password:""}; $scope.cancelEdit(); };
  $scope.loadBooks = function () {
    $scope.loading = true; $scope.error = "";
    BookFactory.getBooks().then(function (r) { $scope.books = r.data; })
      .catch(function (e) { $scope.error = "Books could not load. Check backend and MongoDB."; console.error(e); })
      .finally(function () { $scope.loading = false; });
  };
  $scope.saveBook = function () {
    $scope.message = ""; $scope.error = "";
    var data = {title:($scope.book.title||"").trim(), author:($scope.book.author||"").trim(), category:($scope.book.category||"").trim(), status:$scope.book.status||"Available"};
    if (!data.title || !data.author || !data.category) { $scope.error = "Please fill all fields."; return; }
    var req = $scope.editing ? BookFactory.updateBook($scope.book._id,data) : BookFactory.addBook(data);
    req.then(function (r) { $scope.message = r.data.message || "Book saved successfully."; $scope.cancelEdit(); $scope.loadBooks(); })
      .catch(function (e) { $scope.error = (e.data && e.data.message) || "Book could not be saved."; console.error(e); });
  };
  $scope.editBook = function (b) { $scope.book = angular.copy(b); $scope.editing = true; $scope.message = ""; $scope.error = ""; };
  $scope.cancelEdit = function () { $scope.book = {status:"Available"}; $scope.editing = false; };
  $scope.deleteBook = function (b) {
    if (!confirm('Delete "' + b.title + '"?')) return;
    BookFactory.deleteBook(b._id).then(function (r) { $scope.message = r.data.message || "Book deleted."; $scope.loadBooks(); })
      .catch(function (e) { $scope.error = (e.data && e.data.message) || "Book could not be deleted."; console.error(e); });
  };
});