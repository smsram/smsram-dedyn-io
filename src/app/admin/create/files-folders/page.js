"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Save,
  X,
  Folder,
  File,
  FolderTree,
  Github,
  Upload,
  FolderPlus,
  Trash2,
  Edit2,
  Plus,
  Image as ImageIcon,
  FileCode,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function CreateFileOrFolder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importMethod, setImportMethod] = useState("manual");
  const [sourceCodes, setSourceCodes] = useState([]);
  const [selectedSourceCode, setSelectedSourceCode] = useState("");
  const folderInputRef = useRef(null);

  const [importedItems, setImportedItems] = useState([]);
  const [showImportedItems, setShowImportedItems] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const [githubUrl, setGithubUrl] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [githubFetching, setGithubFetching] = useState(false);

  const [rootFolderName, setRootFolderName] = useState("");
  const [rootEditable, setRootEditable] = useState(false);

  const [manualItems, setManualItems] = useState([
    {
      id: Date.now(),
      type: "folder",
      name: "",
      path: "",
      parent_id: null,
      language: "",
      content: "",
      isImage: false,
    },
  ]);

  useEffect(() => {
    fetchSourceCodes();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    if (!bytes) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const fetchSourceCodes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create/source-codes`);
      const data = await response.json();
      setSourceCodes(data.data || []);
    } catch (error) {
      console.error("Error fetching source codes:", error);
      setSourceCodes([]);
    }
  };

  const isImageFile = (filename) => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".svg",
      ".webp",
      ".bmp",
      ".ico",
    ];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  const getFileExtension = (filename) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const extractGithubInfo = (url) => {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
      return { owner: match[1], repo: match[2].replace(".git", "") };
    }
    return null;
  };

  const fetchFromGithub = async () => {
    setGithubFetching(true);

    try {
      const githubInfo = extractGithubInfo(githubUrl);
      if (!githubInfo) {
        alert("Invalid GitHub URL");
        setGithubFetching(false);
        return;
      }

      const { owner, repo } = githubInfo;

      setRootFolderName(repo);
      setRootEditable(true);

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${githubBranch}?recursive=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch repository");
      }

      const data = await response.json();
      console.log(`📦 Found ${data.tree.length} items in GitHub repository`);

      const itemsPromises = data.tree.map(async (item) => {
        const filename = item.path.split("/").pop();
        const isImage = isImageFile(filename);

        if (item.type === "blob") {
          try {
            const contentResponse = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/${githubBranch}/${item.path}`
            );

            let content = "";

            if (isImage) {
              const blob = await contentResponse.blob();
              const reader = new FileReader();
              content = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
            } else {
              content = await contentResponse.text();
            }

            return {
              id: Date.now() + Math.random(),
              name: filename,
              path: "/" + item.path,
              type: "file",
              size: item.size || 0,
              language: getFileExtension(filename),
              content: content,
              isImage: isImage,
            };
          } catch (error) {
            console.error(`Error fetching ${item.path}:`, error);
            return null;
          }
        } else {
          return {
            id: Date.now() + Math.random(),
            name: item.path.split("/").pop() || item.path,
            path: "/" + item.path,
            type: "folder",
            size: 0,
          };
        }
      });

      const items = (await Promise.all(itemsPromises)).filter(Boolean);

      setImportedItems(items);
      setShowImportedItems(true);
      setExpandedFolders(new Set(["/"])); // Expand root by default
      alert(`Successfully fetched ALL ${items.length} items from ${repo}!`);
    } catch (error) {
      console.error("GitHub fetch error:", error);
      alert("Error fetching from GitHub. Please check the URL and try again.");
    } finally {
      setGithubFetching(false);
    }
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const zipName = file.name.replace(".zip", "");
    setRootFolderName(zipName);
    setRootEditable(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);

      console.log(
        `📦 Processing ZIP with ${Object.keys(contents.files).length} entries`
      );

      const itemsPromises = [];

      for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) {
          itemsPromises.push(
            Promise.resolve({
              id: Date.now() + Math.random(),
              name: path.split("/").filter(Boolean).pop() || path,
              path: "/" + path,
              type: "folder",
              size: 0,
            })
          );
        } else {
          const filename = path.split("/").pop();
          const isImage = isImageFile(filename);

          itemsPromises.push(
            (async () => {
              let content;
              if (isImage) {
                const blob = await zipEntry.async("blob");
                content = await fileToBase64(blob);
              } else {
                content = await zipEntry.async("text");
              }

              return {
                id: Date.now() + Math.random(),
                name: filename,
                path: "/" + path,
                type: "file",
                content: content,
                size: content.length,
                language: getFileExtension(filename),
                isImage: isImage,
              };
            })()
          );
        }
      }

      const items = await Promise.all(itemsPromises);

      setImportedItems(items);
      setShowImportedItems(true);
      setExpandedFolders(new Set(["/"]));
      alert(
        `Successfully extracted ALL ${items.length} items from ${zipName}!`
      );
    } catch (error) {
      console.error("ZIP extraction error:", error);
      alert("Error extracting ZIP file");
    }
  };

  const handleFolderUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log(`📦 Processing ${files.length} files from local folder`);

    const firstFilePath = files[0].webkitRelativePath || files[0].name;
    const rootName = firstFilePath.split("/")[0];
    setRootFolderName(rootName);
    setRootEditable(true);

    try {
      const itemsPromises = files.map(async (file) => {
        const isImage = isImageFile(file.name);
        const path = file.webkitRelativePath || file.name;

        let content;
        if (isImage) {
          content = await fileToBase64(file);
        } else {
          content = await file.text();
        }

        return {
          id: Date.now() + Math.random(),
          name: file.name,
          path: "/" + path,
          type: "file",
          content: content,
          size: file.size,
          language: getFileExtension(file.name),
          isImage: isImage,
        };
      });

      const items = await Promise.all(itemsPromises);

      const folderPaths = new Set();
      items.forEach((item) => {
        const pathParts = item.path.split("/").filter(Boolean);
        for (let i = 1; i < pathParts.length; i++) {
          folderPaths.add("/" + pathParts.slice(0, i).join("/"));
        }
      });

      const folders = Array.from(folderPaths).map((path) => ({
        id: Date.now() + Math.random(),
        name: path.split("/").pop(),
        path: path,
        type: "folder",
        size: 0,
      }));

      const allItems = [...folders, ...items];

      setImportedItems(allItems);
      setShowImportedItems(true);
      setExpandedFolders(new Set(["/"]));
      alert(
        `Successfully imported ALL ${allItems.length} items (${items.length} files) from ${rootName}!`
      );
    } catch (error) {
      console.error("Folder upload error:", error);
      alert("Error uploading folder");
    }
  };

  // Build hierarchical tree structure
  const buildTreeStructure = () => {
    const tree = {};

    importedItems.forEach((item) => {
      const pathParts = item.path.split("/").filter(Boolean);
      const relativePath = rootFolderName
        ? pathParts.slice(1).join("/")
        : pathParts.join("/");
      const parts = relativePath.split("/").filter(Boolean);

      let current = tree;
      parts.forEach((part, index) => {
        if (!current[part]) {
          const isLastPart = index === parts.length - 1;
          const currentPath =
            "/" +
            (rootFolderName ? rootFolderName + "/" : "") +
            parts.slice(0, index + 1).join("/");
          const matchingItem = importedItems.find(
            (i) => i.path === currentPath
          );

          current[part] = {
            name: part,
            path: currentPath,
            type: isLastPart && matchingItem ? matchingItem.type : "folder",
            size: matchingItem?.size || 0,
            isImage: matchingItem?.isImage || false,
            children: {},
          };
        }
        current = current[part].children;
      });
    });

    return tree;
  };

  // Render tree recursively
  const renderTree = (tree, depth = 0) => {
    return Object.entries(tree).map(([name, node]) => {
      const hasChildren = Object.keys(node.children).length > 0;
      const isExpanded = expandedFolders.has(node.path);

      return (
        <div key={node.path} className="tree-node">
          <div
            className="tree-node-item"
            style={{ paddingLeft: `${depth * 20 + 24}px` }}
            onClick={() => {
              if (hasChildren) {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(node.path);
                } else {
                  newExpanded.add(node.path);
                }
                setExpandedFolders(newExpanded);
              }
            }}
          >
            {hasChildren && (
              <span className="tree-toggle">
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </span>
            )}
            {!hasChildren && <span className="tree-spacer"></span>}
            {node.type === "folder" ? (
              <Folder size={14} className="path-icon folder" />
            ) : node.isImage ? (
              <ImageIcon size={14} className="path-icon image" />
            ) : (
              <File size={14} className="path-icon file" />
            )}
            <span className="path-name">{name}</span>
            {node.type === "file" && (
              <span className="path-size">{formatBytes(node.size)}</span>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div className="tree-children">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const deleteImportedItem = (id) => {
    setImportedItems(importedItems.filter((item) => item.id !== id));
  };

  const addManualItem = () => {
    setManualItems([
      ...manualItems,
      {
        id: Date.now(),
        type: "folder",
        name: "",
        path: "",
        parent_id: null,
        language: "",
        content: "",
        isImage: false,
      },
    ]);
  };

  const updateManualItem = (id, field, value) => {
    setManualItems(
      manualItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeManualItem = (id) => {
    if (manualItems.length > 1) {
      setManualItems(manualItems.filter((item) => item.id !== id));
    }
  };

  const handleManualFileUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = isImageFile(file.name);
    let content;

    if (isImage) {
      content = await fileToBase64(file);
    } else {
      content = await file.text();
    }

    updateManualItem(id, "content", content);
    updateManualItem(id, "isImage", isImage);
    updateManualItem(id, "name", file.name);
    updateManualItem(id, "language", getFileExtension(file.name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      importedItems.length === 0 &&
      manualItems.filter((i) => i.name.trim()).length === 0
    ) {
      alert("Please add at least one file or folder");
      return;
    }

    if (!rootFolderName && importedItems.length > 0) {
      alert("Please provide a root folder name");
      return;
    }

    setLoading(true);

    try {
      const allItems = [
        ...importedItems,
        ...manualItems.filter((item) => item.name.trim()),
      ];

      console.log(`📤 Uploading ALL ${allItems.length} items to server`);
      console.log(`📁 Root folder: ${rootFolderName || "None"}`);
      console.log(`🔗 Source code: ${selectedSourceCode || "None"}`);

      // Show uploading message
      const uploadingMsg = `Uploading ${allItems.length} items... Please wait.`;
      console.log(uploadingMsg);

      const response = await fetch(`${BASE_URL}/create/files-folders/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: allItems,
          source_code_id: selectedSourceCode || null,
          root_folder_name: rootFolderName || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show detailed success message
        let message = `✅ Successfully created ${data.data.count} items`;

        if (data.data.skipped > 0) {
          message += ` (${data.data.skipped} duplicates skipped)`;
        }

        if (data.data.errors > 0) {
          message += ` (${data.data.errors} errors)`;
        }

        if (rootFolderName) {
          message += ` under "${rootFolderName}"`;
        }

        message += `!\n\n📊 Summary:\n`;
        message += `   • Total uploaded: ${data.data.count}\n`;
        message += `   • Total size: ${data.data.totalSize || "0 Bytes"}\n`;

        if (data.data.errors > 0) {
          message += `\n⚠️ ${data.data.errors} items failed to upload. Check server logs for details.`;
        }

        alert(message);
        console.log("✅ Upload complete:", data);
        router.push("/admin");
      } else {
        console.error("Error response:", data);
        alert(
          `❌ Error: ${data.error || "Upload failed"}\n\nDetails: ${
            data.details || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        `❌ Network error: ${error.message}\n\nPlease check:\n1. Server is running\n2. Network connection\n3. File size limits`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin");
  };

  return (
    <div className="admin-dashboard">
      <motion.div
        className="admin-form-container admin-form-container-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-form-header">
          <Link href="/admin">
            <motion.button
              className="admin-back-btn"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <div className="admin-form-title-section">
            <h1 className="admin-form-title">Import & Create Files</h1>
            <p className="admin-form-subtitle">
              Import COMPLETE folder structure from multiple sources
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {/* [Import method selection remains the same...] */}
          <div className="admin-form-group">
            <label className="admin-form-label">Import Method</label>
            <div className="admin-import-methods">
              <motion.button
                type="button"
                className={`admin-import-method ${
                  importMethod === "manual" ? "active" : ""
                }`}
                onClick={() => setImportMethod("manual")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FolderPlus size={24} />
                <span>Manual</span>
                <p>Create files one by one</p>
              </motion.button>

              <motion.button
                type="button"
                className={`admin-import-method ${
                  importMethod === "github" ? "active" : ""
                }`}
                onClick={() => setImportMethod("github")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Github size={24} />
                <span>GitHub</span>
                <p>Import ENTIRE repository</p>
              </motion.button>

              <motion.button
                type="button"
                className={`admin-import-method ${
                  importMethod === "zip" ? "active" : ""
                }`}
                onClick={() => setImportMethod("zip")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload size={24} />
                <span>ZIP File</span>
                <p>Extract ALL contents</p>
              </motion.button>

              <motion.button
                type="button"
                className={`admin-import-method ${
                  importMethod === "folder" ? "active" : ""
                }`}
                onClick={() => setImportMethod("folder")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Folder size={24} />
                <span>Local Folder</span>
                <p>Upload ENTIRE folder</p>
              </motion.button>
            </div>
          </div>

          {/* [Source code selection and root folder sections remain the same...] */}
          <div className="admin-form-group">
            <label className="admin-form-label">
              Attach to Source Code (Optional)
            </label>
            <select
              value={selectedSourceCode}
              onChange={(e) => setSelectedSourceCode(e.target.value)}
              className="admin-form-select"
            >
              <option value="">No source code attachment</option>
              {sourceCodes.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.title} ({sc.id})
                </option>
              ))}
            </select>
          </div>

          {rootFolderName && (
            <motion.div
              className="admin-root-folder-section"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="admin-root-folder-header">
                <FolderTree size={20} />
                <h3>Root Folder</h3>
              </div>
              <div className="admin-root-folder-input">
                <input
                  type="text"
                  value={rootFolderName}
                  onChange={(e) => setRootFolderName(e.target.value)}
                  className="admin-form-input"
                  placeholder="Root folder name"
                  disabled={!rootEditable}
                />
                <motion.button
                  type="button"
                  onClick={() => setRootEditable(!rootEditable)}
                  className="admin-btn-small admin-btn-secondary"
                  whileHover={{ scale: 1.05 }}
                >
                  <Edit2 size={16} />
                  <span>{rootEditable ? "Lock" : "Edit"}</span>
                </motion.button>
              </div>
              <p className="admin-form-hint">
                Root folder containing ALL {importedItems.length} imported items
              </p>
            </motion.div>
          )}

          {/* [Import method forms...] */}
          <AnimatePresence mode="wait">
            {importMethod === "github" && (
              <motion.div
                key="github"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="admin-github-import">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        GitHub Repository URL{" "}
                        <span className="required">*</span>
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="admin-form-input"
                        placeholder="https://github.com/username/repository"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Branch</label>
                      <input
                        type="text"
                        value={githubBranch}
                        onChange={(e) => setGithubBranch(e.target.value)}
                        className="admin-form-input"
                        placeholder="main"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={fetchFromGithub}
                    className="admin-btn admin-btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={githubFetching || !githubUrl}
                  >
                    <Github size={18} />
                    <span>
                      {githubFetching
                        ? "Fetching ALL files..."
                        : "Fetch ENTIRE Repository"}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {importMethod === "zip" && (
              <motion.div
                key="zip"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="admin-form-group">
                  <label className="admin-form-label">Upload ZIP File</label>
                  <div className="admin-file-upload">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className="admin-file-input"
                      id="zip-upload"
                    />
                    <label htmlFor="zip-upload" className="admin-file-label">
                      <Upload size={24} />
                      <span>Choose ZIP file</span>
                      <p>Will extract ALL contents</p>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {importMethod === "folder" && (
              <motion.div
                key="folder"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="admin-form-group">
                  <label className="admin-form-label">Upload Folder</label>
                  <div className="admin-file-upload">
                    <input
                      type="file"
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={handleFolderUpload}
                      className="admin-file-input"
                      id="folder-upload"
                      ref={folderInputRef}
                    />
                    <label htmlFor="folder-upload" className="admin-file-label">
                      <Folder size={24} />
                      <span>Choose Folder</span>
                      <p>Will upload ALL files</p>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* COMPLETE TREE STRUCTURE PREVIEW */}
          {importedItems.length > 0 && (
            <div className="admin-imported-section">
              <div className="admin-imported-header">
                <h3>📦 Complete Structure ({importedItems.length} items)</h3>
                <motion.button
                  type="button"
                  onClick={() => setShowImportedItems(!showImportedItems)}
                  className="admin-btn-small admin-btn-secondary"
                  whileHover={{ scale: 1.05 }}
                >
                  {showImportedItems ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showImportedItems ? "Hide" : "Show"}</span>
                </motion.button>
              </div>

              {rootFolderName && showImportedItems && (
                <motion.div
                  className="admin-path-preview"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4>
                    📁 Complete Folder Tree (All {importedItems.length} items):
                  </h4>
                  <div className="path-tree-complete">
                    <div className="path-root">
                      <FolderTree size={16} />
                      <strong>{rootFolderName}/</strong>
                      <span className="item-count">
                        ({importedItems.filter((i) => i.type === "file").length}{" "}
                        files,
                        {
                          importedItems.filter((i) => i.type === "folder")
                            .length
                        }{" "}
                        folders)
                      </span>
                    </div>
                    {renderTree(buildTreeStructure())}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* [Manual creation section remains the same...] */}
          {importMethod === "manual" && (
            <div className="admin-manual-section">
              <div className="admin-manual-header">
                <h3>Manual Creation</h3>
                <motion.button
                  type="button"
                  onClick={addManualItem}
                  className="admin-btn-small admin-btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  <span>Add Item</span>
                </motion.button>
              </div>

              {manualItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="admin-manual-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="admin-manual-item-header">
                    <span className="admin-manual-item-number">
                      #{index + 1}
                    </span>
                    <div className="admin-manual-item-type">
                      <button
                        type="button"
                        className={`admin-type-toggle ${
                          item.type === "folder" ? "active" : ""
                        }`}
                        onClick={() =>
                          updateManualItem(item.id, "type", "folder")
                        }
                      >
                        <Folder size={16} />
                      </button>
                      <button
                        type="button"
                        className={`admin-type-toggle ${
                          item.type === "file" ? "active" : ""
                        }`}
                        onClick={() =>
                          updateManualItem(item.id, "type", "file")
                        }
                      >
                        <File size={16} />
                      </button>
                    </div>
                    {manualItems.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => removeManualItem(item.id)}
                        className="admin-manual-item-delete"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </div>

                  <div className="admin-manual-item-fields">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateManualItem(item.id, "name", e.target.value)
                      }
                      placeholder={
                        item.type === "folder" ? "Folder name" : "File name"
                      }
                      className="admin-form-input"
                    />

                    {item.type === "file" && (
                      <>
                        <div className="admin-file-upload-small">
                          <input
                            type="file"
                            onChange={(e) => handleManualFileUpload(item.id, e)}
                            className="admin-file-input"
                            id={`file-upload-${item.id}`}
                          />
                          <label
                            htmlFor={`file-upload-${item.id}`}
                            className="admin-file-label-small"
                          >
                            <Upload size={16} />
                            <span>Upload File</span>
                          </label>
                        </div>

                        <input
                          type="text"
                          value={item.language}
                          onChange={(e) =>
                            updateManualItem(
                              item.id,
                              "language",
                              e.target.value
                            )
                          }
                          placeholder="Language (tsx, jsx, css)"
                          className="admin-form-input"
                        />

                        {item.isImage ? (
                          item.content && (
                            <div className="admin-image-preview-small">
                              <img src={item.content} alt={item.name} />
                            </div>
                          )
                        ) : (
                          <textarea
                            value={item.content}
                            onChange={(e) =>
                              updateManualItem(
                                item.id,
                                "content",
                                e.target.value
                              )
                            }
                            placeholder="File content..."
                            className="admin-form-textarea"
                            rows={4}
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.875rem",
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="admin-form-actions">
            <motion.button
              type="button"
              onClick={handleCancel}
              className="admin-btn admin-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} />
              <span>Cancel</span>
            </motion.button>
            <motion.button
              type="submit"
              className="admin-btn admin-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              <Save size={18} />
              <span>
                {loading
                  ? "Uploading ALL items..."
                  : `Upload ALL ${
                      importedItems.length +
                      manualItems.filter((i) => i.name).length
                    } Items`}
              </span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
