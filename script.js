/* ========= JAVASCRIPT (Enharmonic Highlighting Fix - May 27, 2025) ========= */
document.addEventListener("DOMContentLoaded", () => {
  // --- Element References ---
  const visualizerRootNoteSelect = document.getElementById(
    "visualizerRootNoteSelect"
  );
  const visualizerScaleTypeSelect = document.getElementById(
    "visualizerScaleTypeSelect"
  );
  const showScaleVisualizerBtn = document.getElementById(
    "show-scale-visualizer-btn"
  );
  const updateMatrixExercisesBtn = document.getElementById(
    "update-matrix-exercises-btn"
  );
  const pianoKeys = document.querySelectorAll(".key");
  const scaleNameDisplay = document.getElementById("scale-name-display");
  const tableContainer = document.getElementById("tableContainer");
  const manualLogBtn = document.getElementById("save-log-btn");
  const manualExerciseInput = document.getElementById("exercise-log");
  const manualDateInput = document.getElementById("practice-date");
  const manualNotesInput = document.getElementById("practice-notes");
  const historyList = document.getElementById("practice-history");
  const printHistoryBtn = document.getElementById("print-history-btn");

  // --- Data Store ---
  const DATA = {
    VISUALIZER_ROOT_NOTES: [
      "C",
      "C#",
      "Db",
      "D",
      "D#",
      "Eb",
      "E",
      "F",
      "F#",
      "Gb",
      "G",
      "G#",
      "Ab",
      "A",
      "A#",
      "Bb",
      "B"
    ],
    VISUALIZER_SCALE_TYPES: [
      { value: "major", display: "Major" },
      { value: "natural_minor", display: "Natural Minor" },
      { value: "harmonic_minor", display: "Harmonic Minor" },
      { value: "melodic_minor", display: "Melodic Minor" },
      { value: "lydian", display: "Lydian" },
      { value: "mixolydian", display: "Mixolydian" },
      { value: "dorian", display: "Dorian" },
      { value: "aeolian", display: "Aeolian (Nat Minor)" },
      { value: "phrygian", display: "Phrygian" },
      { value: "locrian", display: "Locrian" },
      { value: "major_pentatonic", display: "Major Pentatonic" },
      { value: "minor_pentatonic", display: "Minor Pentatonic" },
      { value: "blues", display: "Blues" },
      { value: "whole_tone", display: "Whole Tone" },
      { value: "diminished_wh", display: "Diminished (W-H)" },
      { value: "diminished_hw", display: "Diminished (H-W)" },
      { value: "augmented", display: "Augmented" },
      { value: "flamenco", display: "Flamenco" }
    ],
    MATRIX_DISPLAYABLE_KEYS: [], // Populated in initialize()
    EXERCISE_TEMPLATES: [
      "Scale",
      "Scale in Thirds",
      "Scale in Sixths",
      "Arpeggios Short",
      "Broken Chords",
      "Arpeggios Long (6/3 inv.)",
      "Arpeggios Long (6/4 inv.)",
      "4 Note Chords (octave/inner)",
      "Dominant 7th Chords (5 finger)",
      "Dominant Short Arpeggios",
      "Dominant Broken Chords",
      "Dominant Arpeggios Long (6/3 inv.)",
      "Dominant Arpeggios Long (6/4 inv.)",
      "Chromatic (from tonic)"
    ],
    DOMINANTS: {
      /* Built dynamically in init() */
    },
    TEMPO_OPTIONS: [
      "Slow (40-70 BPM)",
      "Moderate (70-100 BPM)",
      "Fast (100+ BPM)"
    ],
    RHYTHM_PATTERNS: ["Even (Straight)", "LSLS", "SLSL", "SSSL", "LSSS"],
    RHYTHM_VALUES: [
      "Whole",
      "Half",
      "Quarter",
      "Eighth",
      "Sixteenth",
      "Triplet",
      "Dotted Quarter",
      "Dotted Eighth"
    ],
    SHARP_NOTES: [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B"
    ],
    FLAT_NOTES: [
      "C",
      "Db",
      "D",
      "Eb",
      "E",
      "F",
      "Gb",
      "G",
      "Ab",
      "A",
      "Bb",
      "B"
    ],
    SCALE_FORMULAS: {
      major: [2, 2, 1, 2, 2, 2, 1],
      natural_minor: [2, 1, 2, 2, 1, 2, 2],
      harmonic_minor: [2, 1, 2, 2, 1, 3, 1],
      melodic_minor: [2, 1, 2, 2, 2, 2, 1],
      ionian: [2, 2, 1, 2, 2, 2, 1],
      dorian: [2, 1, 2, 2, 2, 1, 2],
      phrygian: [1, 2, 2, 2, 1, 2, 2],
      lydian: [2, 2, 2, 1, 2, 2, 1],
      mixolydian: [2, 2, 1, 2, 2, 1, 2],
      aeolian: [2, 1, 2, 2, 1, 2, 2],
      locrian: [1, 2, 2, 1, 2, 2, 2],
      major_pentatonic: [2, 2, 3, 2, 3],
      minor_pentatonic: [3, 2, 2, 3, 2],
      blues: [3, 2, 1, 1, 3, 2],
      whole_tone: [2, 2, 2, 2, 2, 2],
      diminished_wh: [2, 1, 2, 1, 2, 1, 2, 1],
      diminished_hw: [1, 2, 1, 2, 1, 2, 1, 2],
      augmented: [3, 1, 3, 1, 3, 1],
      flamenco: [1, 3, 1, 2, 1, 2, 2]
    },
    // For mapping generated flat scale notes to the piano key data-attributes (which use sharps)
    FLAT_TO_SHARP_KEY_MAP: { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }
  };

  // --- Helper Functions ---
  const createDropdownCell = (options) => {
    const td = document.createElement("td");
    const select = document.createElement("select");
    options.forEach((opt) => select.add(new Option(opt, opt)));
    td.appendChild(select);
    return td;
  };
  const createInputCell = (type) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = type;
    td.appendChild(input);
    return td;
  };
  const createTimeInputCell = () => {
    const td = document.createElement("td");
    td.classList.add("time-input-cell");
    const hoursSelect = document.createElement("select");
    hoursSelect.classList.add("time-hours");
    for (let i = 0; i <= 8; i++) {
      hoursSelect.add(new Option(i.toString(), i.toString()));
    }
    hoursSelect.add(new Option("8+", "8+"));
    const colonSpan = document.createElement("span");
    colonSpan.className = "time-colon";
    colonSpan.textContent = ":";
    const minutesSelect = document.createElement("select");
    minutesSelect.classList.add("time-minutes");
    for (let i = 0; i < 60; i += 5) {
      minutesSelect.add(
        new Option(i.toString().padStart(2, "0"), i.toString())
      );
    }
    td.appendChild(hoursSelect);
    td.appendChild(colonSpan);
    td.appendChild(minutesSelect);
    return td;
  };

  // --- Core Functions ---
  function renderTable(currentFullKey) {
    if (!tableContainer) {
      console.error("Table container not found!");
      return;
    }
    if (!DATA.MATRIX_DISPLAYABLE_KEYS.includes(currentFullKey)) {
      tableContainer.innerHTML = `<p style="padding:1rem;">Exercises for "${currentFullKey}" are not configured.</p>`;
      return;
    }
    tableContainer.innerHTML = "";
    const table = document.createElement("table");
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const hr1 = thead.insertRow();
    const thEx = document.createElement("th");
    thEx.textContent = "Exercise";
    thEx.rowSpan = 2;
    hr1.appendChild(thEx);
    const thTe = document.createElement("th");
    thTe.textContent = "Tempo";
    thTe.rowSpan = 2;
    hr1.appendChild(thTe);
    const thMe = document.createElement("th");
    thMe.textContent = "Metronome";
    thMe.colSpan = 2;
    thMe.style.textAlign = "center";
    hr1.appendChild(thMe);
    const thRP = document.createElement("th");
    thRP.textContent = "Rhythm Pattern";
    thRP.rowSpan = 2;
    hr1.appendChild(thRP);
    const thSu = document.createElement("th");
    thSu.textContent = "Subdivision";
    thSu.rowSpan = 2;
    hr1.appendChild(thSu);
    const thTi = document.createElement("th");
    thTi.textContent = "Time";
    thTi.rowSpan = 2;
    hr1.appendChild(thTi);
    const thAc = document.createElement("th");
    thAc.textContent = "Action";
    thAc.rowSpan = 2;
    hr1.appendChild(thAc);
    const hr2 = thead.insertRow();
    const thCl = document.createElement("th");
    thCl.textContent = "Click Pattern";
    hr2.appendChild(thCl);
    const thBP = document.createElement("th");
    thBP.textContent = "BPM";
    hr2.appendChild(thBP);

    DATA.EXERCISE_TEMPLATES.forEach((tmpl) => {
      const tr = tbody.insertRow();
      const nC = tr.insertCell();
      nC.classList.add("exercise-name-cell");
      let l1Txt = currentFullKey,
        bTName = tmpl,
        pTxt = "";
      const pM = tmpl.match(/\(([^)]+)\)/);
      if (pM) {
        bTName = tmpl.replace(pM[0], "").trim();
        pTxt = pM[0];
      }
      if (tmpl.toLowerCase().includes("dominant")) {
        const dR = DATA.DOMINANTS[currentFullKey];
        if (dR) {
          l1Txt = `${dR} Dominant`;
          l2Txt = bTName.replace(/Dominant /gi, "").trim();
        } else {
          l1Txt = currentFullKey;
          l2Txt = bTName;
        }
        l3Txt = pTxt;
      } else if (tmpl.toLowerCase().includes("chromatic scale")) {
        l1Txt = currentFullKey.split(" ")[0];
        l2Txt = "Chromatic Scale";
        l3Txt =
          pTxt ||
          (tmpl.toLowerCase().includes("from tonic") ? "(from tonic)" : "");
      } else {
        l2Txt = bTName;
        l3Txt = pTxt;
      }
      const kDD = document.createElement("div");
      kDD.className = "exercise-key-name";
      kDD.textContent = l1Txt;
      const tDD = document.createElement("div");
      tDD.className = "exercise-template-name";
      tDD.textContent = l2Txt;
      nC.appendChild(kDD);
      nC.appendChild(tDD);
      if (l3Txt) {
        const pDD = document.createElement("div");
        pDD.className = "exercise-parenthetical";
        pDD.textContent = l3Txt;
        nC.appendChild(pDD);
      }
      tr.appendChild(createDropdownCell(DATA.TEMPO_OPTIONS));
      tr.appendChild(createInputCell("text"));
      tr.appendChild(createInputCell("number"));
      tr.appendChild(createDropdownCell(DATA.RHYTHM_PATTERNS));
      tr.appendChild(createDropdownCell(DATA.RHYTHM_VALUES));
      tr.appendChild(createTimeInputCell());
      const bCe = tr.insertCell();
      const btn = document.createElement("button");
      btn.textContent = "Log";
      btn.classList.add("btn-outline");
      bCe.appendChild(btn);
    });
    tableContainer.appendChild(table);
  }

  function generateScale(rootNote, scaleFormulaKey) {
    const formula = DATA.SCALE_FORMULAS[scaleFormulaKey];
    if (!formula) {
      console.error(`Scale formula "${scaleFormulaKey}" not found.`);
      return null;
    }
    const noteSet =
      rootNote.includes("b") && !rootNote.includes("#")
        ? DATA.FLAT_NOTES
        : DATA.SHARP_NOTES;
    let searchRoot = rootNote;
    if (noteSet === DATA.SHARP_NOTES) {
      if (rootNote === "Cb") searchRoot = "B";
      if (rootNote === "Fb") searchRoot = "E";
    }
    if (noteSet === DATA.FLAT_NOTES) {
      if (rootNote === "B#") searchRoot = "C";
      if (rootNote === "E#") searchRoot = "F";
    }
    const startIndex = noteSet.indexOf(searchRoot);
    if (startIndex === -1) {
      console.error(
        `Root note "${searchRoot}" (from "${rootNote}") not found in chosen note set [${noteSet.join()}] for formula "${scaleFormulaKey}".`
      );
      return null;
    }
    const result = [noteSet[startIndex]];
    let currentIndex = startIndex;
    for (const interval of formula) {
      currentIndex += interval;
      result.push(noteSet[currentIndex % 12]);
    }
    return result;
  }

  function saveLogEntry(exercise, date, details) {
    if (!date || !exercise) {
      alert("Date and Exercise name are required.");
      return;
    }
    const logEntry = {
      id: Date.now(),
      date,
      exercise,
      time: details.time || "N/A",
      tempo: details.tempo || "N/A",
      clickPattern: details.clickPattern || "",
      bpm: details.bpm || "",
      rhythmPattern: details.rhythmPattern || "N/A",
      subdivision: details.subdivision || "N/A",
      notes: details.notes || ""
    };
    const logs = JSON.parse(localStorage.getItem("practiceLogs") || "[]");
    logs.push(logEntry);
    localStorage.setItem("practiceLogs", JSON.stringify(logs));
    renderPracticeHistory();
  }
  function renderPracticeHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    const logs = JSON.parse(localStorage.getItem("practiceLogs") || "[]");
    logs
      .slice()
      .reverse()
      .forEach((log) => {
        const item = document.createElement("li");
        let dA = [];
        if (log.time && log.time !== "N/A") dA.push(`Time: ${log.time}`);
        if (log.tempo && log.tempo !== "N/A") dA.push(`Tempo: ${log.tempo}`);
        if (log.clickPattern && log.clickPattern.trim() !== "")
          dA.push(`Click Pattern: ${log.clickPattern}`);
        if (log.bpm && log.bpm.trim() !== "") dA.push(`BPM: ${log.bpm}`);
        if (log.rhythmPattern && log.rhythmPattern !== "N/A")
          dA.push(`Rhythm Pattern: ${log.rhythmPattern}`);
        if (log.subdivision && log.subdivision !== "N/A")
          dA.push(`Subdivision: ${log.subdivision}`);
        let dS = dA.join(" / ");
        if (log.notes && log.notes.trim() !== "") {
          dS += (dS ? "<br><em>Notes: </em>" : "<em>Notes: </em>") + log.notes;
        } else if (dS === "") dS = "<em>No specific parameters logged.</em>";
        item.innerHTML = `<strong>${log.date}</strong>: ${log.exercise}<br><em>${dS}</em>`;
        const delB = document.createElement("button");
        delB.className = "delete-log-btn";
        delB.innerHTML = "&times;";
        delB.title = "Delete log";
        delB.onclick = () => deleteLogEntry(log.id);
        item.appendChild(delB);
        historyList.appendChild(item);
      });
  }
  function deleteLogEntry(logId) {
    if (confirm("Are you sure you want to delete this practice log?")) {
      let logs = JSON.parse(localStorage.getItem("practiceLogs") || "[]");
      logs = logs.filter((l) => l.id !== logId);
      localStorage.setItem("practiceLogs", JSON.stringify(logs));
      renderPracticeHistory();
    }
  }
  function printPracticeHistory() {
    const hC = historyList.innerHTML;
    const pFHY = Array.from(historyList.querySelectorAll("li"))
      .map((li) => {
        const cL = li.cloneNode(true);
        const dB = cL.querySelector(".delete-log-btn");
        if (dB) dB.remove();
        return cL.outerHTML;
      })
      .join("");
    const pW = window.open("", "_blank");
    pW.document.write(
      `<html><head><title>Practice History</title><style>body{font-family:sans-serif;margin:20px;}ul{list-style-type:none;padding:0;}li{padding:8px;border-bottom:1px solid #eee;page-break-inside:avoid;}strong{color:#007bff;}em{color:#555;font-size:0.9em;}h1{text-align:center;}</style></head><body><h1>Practice History</h1><ul>${pFHY}</ul></body></html>`
    );
    pW.document.close();
    pW.focus();
    pW.print();
  }
  // REPLACE with this:
  setTimeout(() => {
    try {
      printWindow.print(); // Trigger print dialog
    } catch (e) {
      console.error("Error triggering print dialog:", e);
      // Optionally alert the user if print couldn't be triggered
      // alert("Could not trigger the print dialog. Please check browser settings.");
    }

    // Attempt to close the window after a slightly longer delay,
    // giving the print dialog more time.
    // However, some browsers might still prevent this or leave about:blank.
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
    }, 1000); // Increased delay to 1 second
  }, 250); // Initial delay for content rendering
  function initialize() {
    console.log("Initializing Application (Enharmonic Highlight Fix)...");
    DATA.VISUALIZER_ROOT_NOTES.forEach((n) =>
      visualizerRootNoteSelect.add(new Option(n, n))
    );
    DATA.VISUALIZER_SCALE_TYPES.forEach((st) =>
      visualizerScaleTypeSelect.add(new Option(st.display, st.value))
    );

    DATA.MATRIX_DISPLAYABLE_KEYS = [];
    DATA.DOMINANTS = {}; // Clear before populating
    DATA.VISUALIZER_ROOT_NOTES.forEach((root) => {
      DATA.VISUALIZER_SCALE_TYPES.forEach((scaleType) => {
        const fullKeyName = `${root} ${scaleType.display}`;
        if (!DATA.MATRIX_DISPLAYABLE_KEYS.includes(fullKeyName))
          DATA.MATRIX_DISPLAYABLE_KEYS.push(fullKeyName);
        const noteSet =
          root.includes("b") && !root.includes("#")
            ? DATA.FLAT_NOTES
            : DATA.SHARP_NOTES;
        let searchRoot = root;
        if (noteSet === DATA.SHARP_NOTES) {
          if (root === "Cb") searchRoot = "B";
          if (root === "Fb") searchRoot = "E";
        }
        if (noteSet === DATA.FLAT_NOTES) {
          if (root === "B#") searchRoot = "C";
          if (root === "E#") searchRoot = "F";
        }
        const rootIdx = noteSet.indexOf(searchRoot);
        if (rootIdx !== -1)
          DATA.DOMINANTS[fullKeyName] = noteSet[(rootIdx + 7) % 12];
        else
          console.warn(
            `Dominant calc: Root ${searchRoot} (from ${root}) not found for ${fullKeyName}`
          );
      });
    });

    showScaleVisualizerBtn.addEventListener("click", () => {
      const selRoot = visualizerRootNoteSelect.value;
      const selScaleKey = visualizerScaleTypeSelect.value; // This is 'major', 'natural_minor' etc.
      const selScaleObj = DATA.VISUALIZER_SCALE_TYPES.find(
        (s) => s.value === selScaleKey
      );

      const scaleNotes = generateScale(selRoot, selScaleKey);

      if (scaleNotes) {
        pianoKeys.forEach((k) => k.classList.remove("highlighted"));
        scaleNotes.forEach((noteName) => {
          // noteName could be "Db", "Eb", etc.
          let pianoDataNote = noteName;
          // Convert to sharp equivalent if it's a flat note, for piano key data-note lookup
          if (noteName.includes("b")) {
            // Check if it's a flat spelling
            const sharpEquivalent = DATA.FLAT_TO_SHARP_KEY_MAP[noteName];
            if (sharpEquivalent) {
              pianoDataNote = sharpEquivalent; // e.g., "Db" becomes "C#", "Eb" becomes "D#"
            } else {
              // Fallback for other flats like Cb, Fb if not in map, though they map to naturals
              if (noteName === "Cb") pianoDataNote = "B";
              else if (noteName === "Fb") pianoDataNote = "E";
            }
          }
          // Ensure no '♭' unicode character, piano keys use 'C#' not 'C♭'
          pianoDataNote = pianoDataNote.replace("♭", "#");

          const key = document.querySelector(`[data-note^="${pianoDataNote}"]`);
          if (key) {
            key.classList.add("highlighted");
          } else {
            console.warn(
              `Piano key not found for note: ${noteName} (tried to find data-note starting with ${pianoDataNote})`
            );
          }
        });
        scaleNameDisplay.textContent = `${selRoot} ${
          selScaleObj
            ? selScaleObj.display
            : selScaleKey.charAt(0).toUpperCase() +
              selScaleKey.slice(1).replace(/_/g, " ")
        }`;
      } else {
        scaleNameDisplay.textContent = "Select root & scale type";
      }
    });

    updateMatrixExercisesBtn.addEventListener("click", () => {
      const selectedRoot = visualizerRootNoteSelect.value;
      const selectedScaleFormulaKey = visualizerScaleTypeSelect.value;
      const selectedScaleTypeObject = DATA.VISUALIZER_SCALE_TYPES.find(
        (s) => s.value === selectedScaleFormulaKey
      );
      const displaySuffix = selectedScaleTypeObject
        ? selectedScaleTypeObject.display
        : selectedScaleFormulaKey
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
      const fullKeyForMatrix = `${selectedRoot} ${displaySuffix}`;
      if (DATA.MATRIX_DISPLAYABLE_KEYS.includes(fullKeyForMatrix)) {
        renderTable(fullKeyForMatrix);
      } else {
        tableContainer.innerHTML = `<p style="padding:1rem;">Exercises for "${fullKeyForMatrix}" are not configured.</p>`;
        console.warn(
          `[Matrix Update] Key "${fullKeyForMatrix}" not in MATRIX_DISPLAYABLE_KEYS.`
        );
      }
    });

    if (printHistoryBtn)
      printHistoryBtn.addEventListener("click", printPracticeHistory);

    if (
      DATA.MATRIX_DISPLAYABLE_KEYS.length > 0 &&
      visualizerRootNoteSelect.options.length > 0 &&
      visualizerScaleTypeSelect.options.length > 0
    ) {
      const initialKeyToDisplay = DATA.MATRIX_DISPLAYABLE_KEYS[0];
      const initialRoot = initialKeyToDisplay.split(" ")[0];
      const initialQualityDisplay = initialKeyToDisplay
        .substring(initialRoot.length + 1)
        .trim();
      const initialScaleObj = DATA.VISUALIZER_SCALE_TYPES.find(
        (s) =>
          s.display === initialQualityDisplay ||
          s.display.startsWith(initialQualityDisplay)
      );
      visualizerRootNoteSelect.value = initialRoot;
      if (initialScaleObj)
        visualizerScaleTypeSelect.value = initialScaleObj.value;
      else if (visualizerScaleTypeSelect.options.length > 0)
        visualizerScaleTypeSelect.value =
          visualizerScaleTypeSelect.options[0].value;
      updateMatrixExercisesBtn.click();
      showScaleVisualizerBtn.click();
    } else {
      if (tableContainer)
        tableContainer.innerHTML =
          "<p>Error: No keys available to display exercises.</p>";
      console.error(
        "Initialization Error: MATRIX_DISPLAYABLE_KEYS is empty or visualizer dropdowns not populated."
      );
    }

    renderPracticeHistory();
    if (manualLogBtn) {
      manualLogBtn.addEventListener("click", () => {
        const details = {
          time: "N/A",
          tempo: "N/A",
          clickPattern: "",
          bpm: "",
          rhythmPattern: "N/A",
          subdivision: "N/A",
          notes: manualNotesInput.value
        };
        saveLogEntry(manualExerciseInput.value, manualDateInput.value, details);
        if (manualExerciseInput) manualExerciseInput.value = "";
        if (manualNotesInput) manualNotesInput.value = "";
      });
    }
    if (tableContainer) {
      tableContainer.addEventListener("click", (e) => {
        const t = e.target;
        if (
          t.classList.contains("btn-outline") &&
          t.textContent === "Log" &&
          t.closest("tr")
        ) {
          const row = t.closest("tr");
          if (row && row.cells.length > 7) {
            const keyNameEl = row.cells[0].querySelector(".exercise-key-name");
            const templateNameEl = row.cells[0].querySelector(
              ".exercise-template-name"
            );
            const parenNameEl = row.cells[0].querySelector(
              ".exercise-parenthetical"
            );
            let exFullName = `${keyNameEl ? keyNameEl.textContent : ""} ${
              templateNameEl ? templateNameEl.textContent : ""
            } ${parenNameEl ? parenNameEl.textContent : ""}`
              .trim()
              .replace(/\s\s+/g, " ");
            const detailsToSave = {
              tempo: row.cells[1].querySelector("select")?.value || "N/A",
              clickPattern: row.cells[2].querySelector("input")?.value || "",
              bpm: row.cells[3].querySelector("input")?.value || "",
              rhythmPattern:
                row.cells[4].querySelector("select")?.value || "N/A",
              subdivision: row.cells[5].querySelector("select")?.value || "N/A",
              time:
                (row.cells[6].querySelector(".time-hours")
                  ? row.cells[6].querySelector(".time-hours").value
                  : "0") +
                "h " +
                (row.cells[6].querySelector(".time-minutes")
                  ? row.cells[6]
                      .querySelector(".time-minutes")
                      .value.padStart(2, "0")
                  : "00") +
                "m",
              notes: ""
            };
            saveLogEntry(
              exFullName,
              new Date().toISOString().split("T")[0],
              detailsToSave
            );
            t.textContent = "Logged!";
            setTimeout(() => (t.textContent = "Log"), 2000);
          }
        }
        if (
          t.classList.contains("exercise-name-cell") ||
          t.closest(".exercise-name-cell")
        ) {
          const kn =
            t.closest("td").querySelector(".exercise-key-name")?.textContent ||
            "";
          const tn =
            t.closest("td").querySelector(".exercise-template-name")
              ?.textContent || "";
          const pn =
            t.closest("td").querySelector(".exercise-parenthetical")
              ?.textContent || "";
          if (manualExerciseInput)
            manualExerciseInput.value = `${kn} ${tn} ${pn}`
              .trim()
              .replace(/\s\s+/g, " ");
          if (manualDateInput) manualDateInput.valueAsDate = new Date();
        }
      });
    }
    console.log("Enharmonic Highlighting Fix Initialized.");
  }
  initialize();
});
