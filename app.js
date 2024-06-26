document.addEventListener("DOMContentLoaded", () => {
  const createBoardBtn = document.getElementById("create-board-btn");
  const createBoardMainBtn = document.getElementById("create-board-main-btn");
  const saveBoardBtn = document.getElementById("save-board-btn");
  const boardNameInput = document.getElementById("board-name-input");
  const boardList = document.getElementById("board-list");
  const boardModal = document.getElementById("board-modal");
  const taskModal = document.getElementById("task-modal");
  const closeBtns = document.querySelectorAll(".close");
  const boardTitle = document.getElementById("board-title");
  const addTaskBtn = document.getElementById("add-task-btn");
  const saveTaskBtn = document.getElementById("save-task-btn");
  const taskTitleInput = document.getElementById("task-title-input");
  const taskDescInput = document.getElementById("task-desc-input");
  const taskSubtasksInput = document.getElementById("task-subtasks-input");
  const taskStatusInput = document.getElementById("task-status-input");
  const tasksContainer = document.getElementById("tasks-container");
  const moreOptionsBtn = document.getElementById("more-options-btn");
  const editBoardBtn = document.getElementById("edit-board-btn");
  const deleteBoardBtn = document.getElementById("delete-board-btn");
  const hideSidebarBtn = document.getElementById("hide-sidebar-btn");
  const sidebar = document.querySelector("aside");
  const showSidebarBtn = document.createElement("button");
  const themeToggle = document.getElementById("theme-input");
  const body = document.body;
  let boardIndexToDelete;

  showSidebarBtn.innerHTML = "<img src='images/eye.svg'>";
  showSidebarBtn.className = "show-sidebar-btn";
  showSidebarBtn.style.display = "none";
  document.body.appendChild(showSidebarBtn);

  const loadBoards = () => {
    const boards = JSON.parse(localStorage.getItem("boards")) || [];
    boardList.innerHTML = "";
    document.getElementById(
      "board-count"
    ).textContent = `All Boards (${boards.length})`;

    boards.forEach((board, index) => {
      const li = document.createElement("li");
      li.className = "board-item";
      const img = document.createElement("img");
      img.src = "images/shape.svg";
      img.className = "board-icon";
      li.appendChild(img);
      const span = document.createElement("span");
      span.textContent = board.name;
      li.appendChild(span);
      li.dataset.index = index;
      li.addEventListener("click", () => {
        loadBoard(index);
        const liElements = boardList.querySelectorAll("li");
        liElements.forEach((li) => {
          li.classList.remove("active");
        });
        li.classList.add("active");

        // Update query parameter in URL
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        params.set("activeBoardIndex", index.toString());
        url.search = params.toString();
        window.history.replaceState({}, '', url.toString());
      });
      boardList.appendChild(li);
    });
  };

  const loadBoard = (index) => {
    const boards = JSON.parse(localStorage.getItem("boards")) || [];
    const board = boards[index];
    boardTitle.textContent = board.name;
    tasksContainer.innerHTML = "";

    board.columns.forEach((column, colIndex) => {
      const columnDiv = document.createElement("div");
      columnDiv.classList.add("column", column.className);
      columnDiv.innerHTML = `<h3>${column.name}</h3>`;
      columnDiv.dataset.colIndex = colIndex;

      column.tasks.forEach((task, taskIndex) => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task");
        taskDiv.draggable = true;
        taskDiv.dataset.taskIndex = taskIndex;
        taskDiv.innerHTML = `<h4>${task.title}</h4><p>${task.desc}</p>`;

        taskDiv.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ boardIndex: index, colIndex, taskIndex })
          );
          e.dataTransfer.effectAllowed = "move";
        });

        columnDiv.appendChild(taskDiv);
      });

      columnDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      columnDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        moveTask(
          data.boardIndex,
          data.colIndex,
          data.taskIndex,
          index,
          colIndex
        );
      });

      tasksContainer.appendChild(columnDiv);
    });

    addTaskBtn.style.display = "block";
    addTaskBtn.dataset.index = index;
    moreOptionsBtn.classList.remove("disabled");
    addTaskBtn.classList.remove("disabled");
  };

  const saveBoard = () => {
    const boardName = boardNameInput.value.trim();
    if (boardName === "") return;

    const boards = JSON.parse(localStorage.getItem("boards")) || [];
    boards.push({
      name: boardName,
      columns: [
        { name: "TODO", tasks: [], className: "todo-column" },
        { name: "DOING", tasks: [], className: "doing-column" },
        { name: "DONE", tasks: [], className: "done-column" },
      ],
    });
    localStorage.setItem("boards", JSON.stringify(boards));
    loadBoards();
    boardModal.style.display = "none";
  };

  const saveTask = () => {
    const taskTitle = taskTitleInput.value.trim();
    const taskDesc = taskDescInput.value.trim();
    const taskSubtasks = taskSubtasksInput.value
      .trim()
      .split(",")
      .map((subtask) => subtask.trim());
    const taskStatus = taskStatusInput.value;
    if (taskTitle === "" || taskDesc === "") return;

    const boards = JSON.parse(localStorage.getItem("boards")) || [];
    const boardIndex = addTaskBtn.dataset.index;
    boards[boardIndex].columns
      .find((column) => column.name.toLowerCase() === taskStatus)
      .tasks.push({ title: taskTitle, desc: taskDesc, subtasks: taskSubtasks });
    localStorage.setItem("boards", JSON.stringify(boards));
    loadBoard(boardIndex);
    taskModal.style.display = "none";
  };

  const moveTask = (
    fromBoardIndex,
    fromColIndex,
    fromTaskIndex,
    toBoardIndex,
    toColIndex
  ) => {
    const boards = JSON.parse(localStorage.getItem("boards")) || [];
    const task = boards[fromBoardIndex].columns[fromColIndex].tasks.splice(
      fromTaskIndex,
      1
    )[0];
    boards[toBoardIndex].columns[toColIndex].tasks.push(task);
    localStorage.setItem("boards", JSON.stringify(boards));
    loadBoard(toBoardIndex);
  };

  const hideSidebar = () => {
    sidebar.style.display = "none";
    showSidebarBtn.style.display = "block";
  };

  const showSidebar = () => {
    sidebar.style.display = "block";
    showSidebarBtn.style.display = "none";
  };

  createBoardBtn.addEventListener("click", () => {
    boardModal.style.display = "block";
  });
  createBoardMainBtn.addEventListener("click", () => {
    boardModal.style.display = "block";
  });

  saveBoardBtn.addEventListener("click", saveBoard);
  saveTaskBtn.addEventListener("click", saveTask);

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      boardModal.style.display = "none";
      taskModal.style.display = "none";
    });
  });

  addTaskBtn.addEventListener("click", () => {
    taskModal.style.display = "block";
  });

  window.addEventListener("click", (event) => {
    if (event.target == boardModal) boardModal.style.display = "none";
    if (event.target == taskModal) taskModal.style.display = "none";
  });

  moreOptionsBtn.addEventListener("click", () => {
    const dropdown = document.querySelector(".dropdown-content");
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
    const dropdown = document.querySelector(".dropdown-content");
    if (
      !moreOptionsBtn.contains(event.target) &&
      !dropdown.contains(event.target)
    ) {
      dropdown.style.display = "none";
    }
  });

  editBoardBtn.addEventListener("click", () => {
    const boards = JSON.parse(localStorage.getItem("boards")) || [];
    const boardIndex = addTaskBtn.dataset.index;
    const newBoardName = prompt(
      "Enter new board name:",
      boards[boardIndex].name
    );
    if (newBoardName) {
      boards[boardIndex].name = newBoardName;
      localStorage.setItem("boards", JSON.stringify(boards));
      loadBoards();
      loadBoard(boardIndex);
    }
  });

  deleteBoardBtn.addEventListener("click", () => {
    const boards = JSON.parse(localStorage.getItem("boards")) || [];
    const boardIndex = addTaskBtn.dataset.index;
    boards.splice(boardIndex, 1);
    localStorage.setItem("boards", JSON.stringify(boards));
    boardTitle.textContent = "Select or Create a Board";
    tasksContainer.innerHTML = "";
    addTaskBtn.style.display = "none";
    moreOptionsBtn.classList.add("disabled");
    addTaskBtn.classList.add("disabled");
    loadBoards();
  });

  hideSidebarBtn.addEventListener("click", hideSidebar);
  showSidebarBtn.addEventListener("click", showSidebar);

  // Function to read query parameter from URL
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };
