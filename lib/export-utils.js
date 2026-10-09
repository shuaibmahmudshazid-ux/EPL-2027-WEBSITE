import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Helper to invoke jspdf-autotable across different module bundlers safely
 */
const renderTable = (doc, options) => {
  if (typeof autoTable === "function") {
    autoTable(doc, options);
  } else if (autoTable?.default && typeof autoTable.default === "function") {
    autoTable.default(doc, options);
  } else if (typeof doc.autoTable === "function") {
    doc.autoTable(options);
  }
};

/**
 * Format a Date for display and filename
 */
const getFormattedDate = () => {
  const now = new Date();
  return {
    display: now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    fileSuffix: now.toISOString().split("T")[0],
  };
};

/**
 * Add standard EPL branded header to a PDF
 */
const addDocumentHeader = (doc, title, subtitle, totalCountLabel) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { display } = getFormattedDate();

  // Dark brand banner at the top
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  // Gold accent line
  doc.setFillColor(242, 196, 106); // gold
  doc.rect(0, 28, pageWidth, 2, "F");

  // Tournament title
  doc.setTextColor(242, 196, 106);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("EPL 2027 • PREMIER LEAGUE", 14, 12);

  // Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title.toUpperCase(), 14, 20);

  // Metadata on right side
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.text(`Generated: ${display}`, pageWidth - 14, 12, { align: "right" });
  if (totalCountLabel) {
    doc.setTextColor(242, 196, 106);
    doc.setFont("helvetica", "bold");
    doc.text(totalCountLabel, pageWidth - 14, 20, { align: "right" });
  }

  if (subtitle) {
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(subtitle, 14, 36);
  }
};

/**
 * Attach standard footer hook to PDF options
 */
const createFooterHook = () => {
  return (data) => {
    const doc = data.doc;
    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
    const totalPages = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    // Left & Right text
    doc.text(
      "EPL 2027 Official Tournament Registry • Patuakhali Science and Technology University",
      14,
      pageHeight - 6
    );
    doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 6,
      { align: "right" }
    );
  };
};

// ============================================================================
// PLAYERS EXPORT
// ============================================================================

/**
 * Export player list to formatted PDF
 */
export const exportPlayersToPdf = (players = [], options = {}) => {
  const { title = "Official Players Roster", filterDescription = "" } = options;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const totalPlayers = players.length;
  const approvedCount = players.filter((p) => p.status === "approved").length;
  const pendingCount = players.filter((p) => p.status === "pending").length;
  const assignedCount = players.filter(
    (p) => p.team?.name || p.team
  ).length;

  const countLabel = `Total: ${totalPlayers} Players (${approvedCount} Approved, ${pendingCount} Pending, ${assignedCount} Team Assigned)`;

  addDocumentHeader(doc, title, filterDescription, countLabel);

  const tableHeaders = [
    [
      "#",
      "Full Name",
      "Student ID",
      "Reg. No",
      "Session",
      "Phone",
      "Email",
      "Category",
      "Tier",
      "Status",
      "Team",
      "Base ৳",
      "Sold ৳",
    ],
  ];

  const tableRows = players.map((player, index) => {
    const teamName =
      typeof player.team === "object" && player.team !== null
        ? player.team.name
        : typeof player.team === "string" && player.team
        ? player.team
        : "Unassigned";

    const tierName =
      player.auctionTier?.name || player.tier || "No Tier";

    const categories = Array.isArray(player.categories)
      ? player.categories.join(", ")
      : player.categories || "—";

    const basePrice =
      player.basePrice || player.auctionTier?.basePrice
        ? Number(player.basePrice || player.auctionTier?.basePrice).toLocaleString()
        : "0";

    const soldPrice =
      player.soldPrice !== null && player.soldPrice !== undefined
        ? Number(player.soldPrice).toLocaleString()
        : "—";

    return [
      index + 1,
      player.fullName || "—",
      player.playerId || "—",
      player.registrationNumber || "—",
      player.session || "—",
      player.phone || "—",
      player.email || "—",
      categories,
      tierName,
      (player.status || "pending").toUpperCase(),
      teamName,
      basePrice,
      soldPrice,
    ];
  });

  renderTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY: filterDescription ? 40 : 34,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [242, 196, 106],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 32, fontStyle: "bold" },
      2: { cellWidth: 20 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 24 },
      6: { cellWidth: 34 },
      7: { cellWidth: 26 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18, fontStyle: "bold" },
      10: { cellWidth: 26 },
      11: { cellWidth: 16, halign: "right" },
      12: { cellWidth: 16, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      // Highlight status badge colors
      if (data.section === "body" && data.column.index === 9) {
        const val = String(data.cell.raw).toLowerCase();
        if (val === "approved") {
          data.cell.styles.textColor = [22, 101, 52]; // green-800
        } else if (val === "rejected") {
          data.cell.styles.textColor = [153, 27, 27]; // red-800
        } else {
          data.cell.styles.textColor = [161, 98, 7]; // amber-700
        }
      }
    },
    didDrawPage: createFooterHook(),
    margin: { top: 32, bottom: 18, left: 14, right: 14 },
  });

  const { fileSuffix } = getFormattedDate();
  doc.save(`EPL_2027_Players_${fileSuffix}.pdf`);
};

/**
 * Export player list to formatted Excel spreadsheet (.xlsx)
 */
export const exportPlayersToExcel = (players = [], options = {}) => {
  const { fileName = `EPL_2027_Players_${getFormattedDate().fileSuffix}.xlsx` } = options;

  const data = players.map((player, index) => {
    const teamName =
      typeof player.team === "object" && player.team !== null
        ? player.team.name
        : typeof player.team === "string" && player.team
        ? player.team
        : "Unassigned";

    const tierName =
      player.auctionTier?.name || player.tier || "Unassigned";

    return {
      "SL #": index + 1,
      "Full Name": player.fullName || "",
      "Student ID": player.playerId || "",
      "Registration Number": player.registrationNumber || "",
      "Session": player.session || "",
      "Phone Number": player.phone || "",
      "Email Address": player.email || "",
      "Playing Categories / Role": Array.isArray(player.categories)
        ? player.categories.join(", ")
        : player.categories || "",
      "Registration Status": (player.status || "pending").toUpperCase(),
      "Assigned Team": teamName,
      "Auction Tier": tierName,
      "Base Price (৳)": Number(player.basePrice || player.auctionTier?.basePrice || 0),
      "Sold Price (৳)": player.soldPrice !== null && player.soldPrice !== undefined
        ? Number(player.soldPrice)
        : "",
      "Auction Status": player.auctionStatus || "upcoming",
      "Payment Method": player.paymentMethod || "",
      "Transaction ID / Received By":
        player.transactionId || player.cashReceivedBy || "",
      "Registration Date": player.createdAt
        ? new Date(player.createdAt).toISOString().split("T")[0]
        : "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => (row[key] !== undefined && row[key] !== null ? String(row[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Players");

  // Summary sheet with stats
  const totalCount = players.length;
  const approved = players.filter((p) => p.status === "approved").length;
  const pending = players.filter((p) => p.status === "pending").length;
  const rejected = players.filter((p) => p.status === "rejected").length;
  const sold = players.filter((p) => p.auctionStatus === "sold" || p.soldPrice).length;
  const totalAuctionSpent = players.reduce((sum, p) => sum + Number(p.soldPrice || 0), 0);

  const summaryData = [
    { "Metric": "Tournament", "Value": "EPL 2027 • PREMIER LEAGUE" },
    { "Metric": "Report Generated", "Value": getFormattedDate().display },
    { "Metric": "Total Registered Players", "Value": totalCount },
    { "Metric": "Approved Players", "Value": approved },
    { "Metric": "Pending Review", "Value": pending },
    { "Metric": "Rejected Applications", "Value": rejected },
    { "Metric": "Sold Players", "Value": sold },
    { "Metric": "Total Auction Spent (৳)", "Value": totalAuctionSpent },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Overview Summary");

  XLSX.writeFile(workbook, fileName);
};

// ============================================================================
// TEAMS EXPORT
// ============================================================================

/**
 * Export all teams overview to formatted PDF
 */
export const exportTeamsToPdf = (teams = [], allPlayers = [], options = {}) => {
  const { title = "Official Teams & Franchises Directory", filterDescription = "" } = options;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const totalTeams = teams.length;
  const activeTeams = teams.filter((t) => t.status !== "inactive").length;
  const totalPurseBudget = teams.reduce((acc, t) => acc + (t.points || 50000), 0);
  const totalPurseSpent = teams.reduce((acc, t) => acc + (t.pointsSpent || 0), 0);

  const countLabel = `Total: ${totalTeams} Franchises (${activeTeams} Active) • Total Purse: ${totalPurseBudget.toLocaleString()} PTS`;

  addDocumentHeader(doc, title, filterDescription, countLabel);

  const tableHeaders = [
    [
      "#",
      "Team Name",
      "Team Key",
      "Status",
      "Squad Size",
      "Purse Budget",
      "Purse Spent",
      "Purse Remaining",
      "Team Managers & Contact Information",
    ],
  ];

  const tableRows = teams.map((team, index) => {
    // Count squad players
    const squadCount =
      Array.isArray(team.players) && team.players.length > 0
        ? team.players.length
        : allPlayers.filter(
            (p) =>
              (p.team?._id && String(p.team._id) === String(team._id)) ||
              (typeof p.team === "string" && p.team === team.name)
          ).length;

    const budget = team.points || 50000;
    const spent = team.pointsSpent || 0;
    const remaining = Math.max(0, budget - spent);

    const managersText = (team.managers || [])
      .map((m) => `${m.name || "Manager"} (Ph: ${m.phone || "—"}, Email: ${m.email || "—"})`)
      .join("\n") || "No managers assigned";

    return [
      index + 1,
      team.name || "—",
      team.uniqueKey || "—",
      (team.status || "active").toUpperCase(),
      `${squadCount} Players`,
      `${budget.toLocaleString()} PTS`,
      `${spent.toLocaleString()} PTS`,
      `${remaining.toLocaleString()} PTS`,
      managersText,
    ];
  });

  renderTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY: filterDescription ? 40 : 34,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [242, 196, 106],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 36, fontStyle: "bold" },
      2: { cellWidth: 24, fontStyle: "bold" },
      3: { cellWidth: 18, fontStyle: "bold" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 24, halign: "right" },
      7: { cellWidth: 26, halign: "right", fontStyle: "bold" },
      8: { cellWidth: "auto" },
    },
    didDrawPage: createFooterHook(),
    margin: { top: 32, bottom: 18, left: 14, right: 14 },
  });

  const { fileSuffix } = getFormattedDate();
  doc.save(`EPL_2027_Teams_${fileSuffix}.pdf`);
};

/**
 * Export all teams and their rosters to Excel workbook (.xlsx)
 */
export const exportTeamsToExcel = (teams = [], allPlayers = [], options = {}) => {
  const { fileName = `EPL_2027_Teams_${getFormattedDate().fileSuffix}.xlsx` } = options;

  // Sheet 1: Teams Overview
  const teamsData = teams.map((team, index) => {
    const squadPlayers = allPlayers.filter(
      (p) =>
        (p.team?._id && String(p.team._id) === String(team._id)) ||
        (typeof p.team === "string" && p.team === team.name) ||
        (Array.isArray(team.players) &&
          team.players.some(
            (tp) => String(tp._id || tp) === String(p._id)
          ))
    );

    const squadCount = squadPlayers.length || (Array.isArray(team.players) ? team.players.length : 0);
    const budget = team.points || 50000;
    const spent = team.pointsSpent || 0;
    const remaining = Math.max(0, budget - spent);

    const managersList = (team.managers || [])
      .map((m) => `${m.name} [Phone: ${m.phone}, Email: ${m.email}]`)
      .join("; ");

    return {
      "SL #": index + 1,
      "Team Name": team.name || "",
      "Unique Key": team.uniqueKey || "",
      "Status": (team.status || "active").toUpperCase(),
      "Squad Size": squadCount,
      "Purse Budget (PTS)": budget,
      "Purse Spent (PTS)": spent,
      "Purse Remaining (PTS)": remaining,
      "Manager Details": managersList || "None",
      "Created Date": team.createdAt
        ? new Date(team.createdAt).toISOString().split("T")[0]
        : "",
    };
  });

  const workbook = XLSX.utils.book_new();

  const teamsWorksheet = XLSX.utils.json_to_sheet(teamsData);
  const colWidths = Object.keys(teamsData[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...teamsData.map((row) => (row[key] ? String(row[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
  });
  teamsWorksheet["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(workbook, teamsWorksheet, "Teams Directory");

  // Sheet 2: Squad Rosters
  const squadRows = [];
  let squadIndex = 1;

  teams.forEach((team) => {
    const squadPlayers = allPlayers.filter(
      (p) =>
        (p.team?._id && String(p.team._id) === String(team._id)) ||
        (typeof p.team === "string" && p.team === team.name) ||
        (Array.isArray(team.players) &&
          team.players.some(
            (tp) => String(tp._id || tp) === String(p._id)
          ))
    );

    squadPlayers.forEach((player) => {
      squadRows.push({
        "SL #": squadIndex++,
        "Team Name": team.name,
        "Player Name": player.fullName || "—",
        "Student ID": player.playerId || "—",
        "Reg. No": player.registrationNumber || "—",
        "Session": player.session || "—",
        "Phone": player.phone || "—",
        "Email": player.email || "—",
        "Category / Role": Array.isArray(player.categories)
          ? player.categories.join(", ")
          : player.categories || "—",
        "Auction Tier": player.auctionTier?.name || player.tier || "No Tier",
        "Base Price (৳)": Number(player.basePrice || player.auctionTier?.basePrice || 0),
        "Sold Price (৳ / PTS)": player.soldPrice !== null && player.soldPrice !== undefined
          ? Number(player.soldPrice)
          : 0,
      });
    });
  });

  if (squadRows.length > 0) {
    const squadWorksheet = XLSX.utils.json_to_sheet(squadRows);
    const squadCols = Object.keys(squadRows[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...squadRows.map((row) => (row[key] ? String(row[key]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 3, 10), 35) };
    });
    squadWorksheet["!cols"] = squadCols;
    XLSX.utils.book_append_sheet(workbook, squadWorksheet, "Full Squad Rosters");
  }

  XLSX.writeFile(workbook, fileName);
};

// ============================================================================
// INDIVIDUAL TEAM & SQUAD EXPORT
// ============================================================================

/**
 * Export single team with its full squad roster to PDF
 */
export const exportSingleTeamToPdf = (team, squadPlayers = [], options = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const budget = team.points || 50000;
  const spent = team.pointsSpent || 0;
  const remaining = Math.max(0, budget - spent);
  const totalSquadValuation = squadPlayers.reduce(
    (acc, p) => acc + Number(p.soldPrice || 0),
    0
  );

  addDocumentHeader(
    doc,
    `TEAM ROSTER: ${team.name}`,
    `Official Squad & Franchise Roster`,
    `Squad: ${squadPlayers.length} Players`
  );

  // Franchise info box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, 182, 38, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Team: ${team.name}`, 18, 42);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Unique Key: ${team.uniqueKey || "N/A"}`, 18, 48);
  doc.text(`Status: ${(team.status || "active").toUpperCase()}`, 18, 54);

  // Financials
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Purse Budget:", 110, 42);
  doc.setFont("helvetica", "normal");
  doc.text(`${budget.toLocaleString()} PTS`, 150, 42);

  doc.setFont("helvetica", "bold");
  doc.text("Purse Spent:", 110, 48);
  doc.setFont("helvetica", "normal");
  doc.text(`${spent.toLocaleString()} PTS`, 150, 48);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9); // amber
  doc.text("Purse Remaining:", 110, 54);
  doc.text(`${remaining.toLocaleString()} PTS`, 150, 54);

  // Managers
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  const managersStr = (team.managers || [])
    .map((m) => `${m.name} (${m.phone}, ${m.email})`)
    .join(" • ") || "None assigned";
  doc.text(`Managers: ${managersStr}`, 18, 64, { maxWidth: 174 });

  // Squad table
  const tableHeaders = [
    [
      "#",
      "Player Name",
      "Student ID",
      "Reg. No",
      "Session",
      "Role / Category",
      "Tier",
      "Sold Price (৳ / PTS)",
    ],
  ];

  const tableRows = squadPlayers.map((player, index) => [
    index + 1,
    player.fullName || "—",
    player.playerId || "—",
    player.registrationNumber || "—",
    player.session || "—",
    Array.isArray(player.categories) ? player.categories.join(", ") : player.categories || "—",
    player.auctionTier?.name || player.tier || "—",
    Number(player.soldPrice || 0).toLocaleString(),
  ]);

  renderTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY: 76,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [242, 196, 106],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 42, fontStyle: "bold" },
      2: { cellWidth: 24 },
      3: { cellWidth: 22 },
      4: { cellWidth: 20 },
      5: { cellWidth: 32 },
      6: { cellWidth: 16 },
      7: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
    didDrawPage: createFooterHook(),
    margin: { top: 32, bottom: 18, left: 14, right: 14 },
  });

  const sanitizedTeamName = (team.name || "Team").replace(/[^a-zA-Z0-9_-]/g, "_");
  const { fileSuffix } = getFormattedDate();
  doc.save(`EPL_2027_${sanitizedTeamName}_Squad_${fileSuffix}.pdf`);
};

/**
 * Export single team with its full squad roster to Excel (.xlsx)
 */
export const exportSingleTeamToExcel = (team, squadPlayers = [], options = {}) => {
  const sanitizedTeamName = (team.name || "Team").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `EPL_2027_${sanitizedTeamName}_Squad_${getFormattedDate().fileSuffix}.xlsx`;

  const budget = team.points || 50000;
  const spent = team.pointsSpent || 0;
  const remaining = Math.max(0, budget - spent);

  // Sheet 1: Team Details
  const teamDetailsData = [
    { Property: "Franchise Name", Value: team.name },
    { Property: "Unique Key", Value: team.uniqueKey },
    { Property: "Status", Value: (team.status || "active").toUpperCase() },
    { Property: "Total Squad Count", Value: squadPlayers.length },
    { Property: "Initial Purse Budget (PTS)", Value: budget },
    { Property: "Purse Spent (PTS)", Value: spent },
    { Property: "Purse Remaining (PTS)", Value: remaining },
    {
      Property: "Team Managers",
      Value: (team.managers || [])
        .map((m) => `${m.name} (${m.phone}, ${m.email})`)
        .join("; ") || "None",
    },
  ];

  const workbook = XLSX.utils.book_new();

  const detailsWorksheet = XLSX.utils.json_to_sheet(teamDetailsData);
  detailsWorksheet["!cols"] = [{ wch: 28 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, detailsWorksheet, "Team Details");

  // Sheet 2: Squad Roster
  const squadData = squadPlayers.map((player, index) => ({
    "SL #": index + 1,
    "Full Name": player.fullName || "",
    "Student ID": player.playerId || "",
    "Registration Number": player.registrationNumber || "",
    "Session": player.session || "",
    "Phone Number": player.phone || "",
    "Email Address": player.email || "",
    "Category / Role": Array.isArray(player.categories)
      ? player.categories.join(", ")
      : player.categories || "",
    "Auction Tier": player.auctionTier?.name || player.tier || "",
    "Base Price (৳)": Number(player.basePrice || player.auctionTier?.basePrice || 0),
    "Sold Price (৳ / PTS)": Number(player.soldPrice || 0),
    "Auction Status": player.auctionStatus || "sold",
  }));

  const squadWorksheet = XLSX.utils.json_to_sheet(squadData);
  const squadCols = Object.keys(squadData[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...squadData.map((row) => (row[key] ? String(row[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 10), 35) };
  });
  squadWorksheet["!cols"] = squadCols;
  XLSX.utils.book_append_sheet(workbook, squadWorksheet, "Squad Roster");

  XLSX.writeFile(workbook, fileName);
};
