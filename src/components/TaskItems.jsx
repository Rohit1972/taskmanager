import React, { useEffect, useState } from "react";
import { MENU_OPTIONS, TI_CLASSES, getPriorityColor } from "../assets/dummy";
import { Calendar, CheckCircle2, Clock, MoreVertical } from "lucide-react";
import axios from "axios";
import { isToday, format } from "date-fns";
import TaskModel from "./TaskModel.jsx";

const API_BASE = "http://localhost:4000/api/tasks";

const TaskItems = ({
  task,
  onRefresh,
  onLogout,
  showCompleteCheckBox = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, "yes"].includes(
      typeof task.completed === "string"
        ? task.completed.toLowerCase()
        : task.completed
    )
  );
  const [showEditModel, setShowEditModel] = useState(false);
  const [subTasks, setSubTasks] = useState(task.subTasks || []);

  useEffect(() => {
    setIsCompleted(
      [true, 1, "yes"].includes(
        typeof task.completed === "string"
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
  }, [task.completed]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");
    return { Authorization: `Bearer ${token}` };
  };

  const borderColor = isCompleted
    ? " border-green-500"
    : getPriorityColor(task.priority).split(" ")[0];

  const progress = subTasks.length
    ? (subTasks.filter((st) => st.completed).length / subTasks.length) * 100
    : 0;

  const handleComplete = async () => {
    const newStatus = isCompleted ? "No" : "Yes";
    try {
      await axios.put(
        `${API_BASE}/${task._id}/gp`,
        { completed: newStatus },
        { headers: getAuthHeaders() }
      );
      setIsCompleted(!isCompleted);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") setShowEditModel(true);
    if (action === "delete") handleDelete();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, {
        headers: getAuthHeaders(),
      });
      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleSave = async (updateTask) => {
    try {
      const { title, description, priority, dueDate, completed } = updateTask;
      await axios.put(
        `${API_BASE}/${task._id}/gp`,
        { title, description, priority, dueDate, completed },
        { headers: getAuthHeaders() }
      );
      setShowEditModel(false);
      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  return (
    <>
      <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
        <div className={TI_CLASSES.leftContainer}>
          {showCompleteCheckBox && (
            <button
              onClick={handleComplete}
              className={`${TI_CLASSES.completeBtn} ${
                isCompleted ? "text-green-500" : "text-gray-300"
              }`}
            >
              <CheckCircle2
                size={18}
                className={`${TI_CLASSES.checkboxIconBase} ${
                  isCompleted ? "fill-green-500" : ""
                }`}
              />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h3
                className={`${TI_CLASSES.titleBase} ${
                  isCompleted ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`${TI_CLASSES.priorityBadge} ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p className={TI_CLASSES.description}>{task.description}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={TI_CLASSES.menuButton}
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {showMenu && (
            <div className={TI_CLASSES.menuDropdown}>
              {MENU_OPTIONS.map((opt) => (
                <button
                  key={opt.action}
                  onClick={() => handleAction(opt.action)}
                  className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-purple-50 flex items-center gap-2 transition-colors duration-200"
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div
            className={`${TI_CLASSES.dateRow} ${
              task.dueDate && isToday(new Date(task.dueDate))
                ? "text-fuchsia-600"
                : "text-gray-500"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {task.dueDate
              ? isToday(new Date(task.dueDate))
                ? "Today"
                : format(new Date(task.dueDate), "MM dd")
              : "-"}
          </div>
          <div className={TI_CLASSES.createdRow}>
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {task.createdAt
              ? `Created ${format(new Date(task.createdAt), "MM dd")}`
              : "no data"}
          </div>
        </div>
      </div>

      <TaskModel
        isOpen={showEditModel}
        onClose={() => setShowEditModel(false)}
        taskToEdit={task}
        onSave={handleSave}
      />
    </>
  );
};

export default TaskItems;
