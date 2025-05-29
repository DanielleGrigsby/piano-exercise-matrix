/* ========= JAVASCRIPT (Enharmonic Highlighting Fix - May 27, 2025) ========= */
// Initialize Tone.js Synthesizer globally
const synth = new Tone.Synth().toDestination();
let currentScaleSequence = null; // To keep track of the currently playing sequence
document.addEventListener("DOMContentLoaded", () => {
  // --- Element References ---
  const visualizerRootNoteSelect = document.getElementById(
    "visualizerRootNoteSelect"
  );
  const visualizerScaleTypeSelect = document.getElementById(
    "visualizerScaleTypeSelect"
  );
  const playScaleVisualizerBtn = document.getElementById(
    "play-scale-visualizer-btn"
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
    console.log("--- EXECUTING generateScale (Definitive Version from #141) ---"); // NEW DIAGNOSTIC LOG
    const formula = DATA.SCALE_FORMULAS[scaleFormulaKey];
    if (!formula) {
        console.error(`generateScale: Scale formula "${scaleFormulaKey}" not found for root "${rootNote}".`);
        return null;
    }

    const noteSet = (rootNote.includes("b") && !rootNote.includes("#")) ? DATA.FLAT_NOTES : DATA.SHARP_NOTES;
    
    let searchRoot = rootNote;
    // Normalize common enharmonics for correct indexing
    if (noteSet === DATA.SHARP_NOTES) {
        if (rootNote === "Cb") searchRoot = "B"; 
        else if (rootNote === "Fb") searchRoot = "E";
    }
    if (noteSet === DATA.FLAT_NOTES) {
        if (rootNote === "B#") searchRoot = "C"; 
        else if (rootNote === "E#") searchRoot = "F";
    }

    const rootNoteIndexInSet = noteSet.indexOf(searchRoot);
    if (rootNoteIndexInSet === -1) {
        console.error(`generateScale: Root note "${searchRoot}" (derived from "${rootNote}") not found for chosen note set [${noteSet.join()}] for formula "${scaleFormulaKey}".`);
        return null;
    }
    
    const scaleNotesWithOctaves = [];
    // Apply your starting octave rule: "B" roots start in octave 2, all others start in octave 3.
    let currentOctave = (searchRoot === "B") ? 2 : 3;
    
    let currentPitchValue = rootNoteIndexInSet; 
    let previousNoteBaseIndexForOctaveCheck = -1; 

    // Add the root note first
    scaleNotesWithOctaves.push(noteSet[currentPitchValue % 12] + currentOctave);
    previousNoteBaseIndexForOctaveCheck = currentPitchValue % 12;
        
    // Subsequent notes based on intervals
    for (let i = 0; i < formula.length; i++) { 
        currentPitchValue += formula[i]; 
        const currentNoteBaseIndex = currentPitchValue % 12;
        const noteName = noteSet[currentNoteBaseIndex]; 

        // Octave increment logic
        if (currentNoteBaseIndex < previousNoteBaseIndexForOctaveCheck) {
            currentOctave++;
        }
        
        scaleNotesWithOctaves.push(noteName + currentOctave); // CLEAN note string
        
        previousNoteBaseIndexForOctaveCheck = currentNoteBaseIndex; 
    }
    
    // console.log(`generateScale output for ${rootNote} ${scaleFormulaKey}: ${scaleNotesWithOctaves.join(', ')}`);
    return scaleNotesWithOctaves;
}
// === END OF generateScale FUNCTION ===

function saveLogEntry(exercise, date, details) {
    if (!date || !exercise) {
        alert("Date and Exercise name are required for logging.");
        return;
    }
    const logEntry = {
        id: Date.now(), // Unique ID for each log
        date: date,
        exercise: exercise,
        time: details.time || "N/A",
        tempo: details.tempo || "N/A",
        clickPattern: details.clickPattern || "", // Default to empty string if not applicable
        bpm: details.bpm || "",                 // Default to empty string if not applicable
        rhythmPattern: details.rhythmPattern || "N/A",
        subdivision: details.subdivision || "N/A",
        notes: details.notes || "" // For manual entry notes or other notes
    };
    try {
        const logs = JSON.parse(localStorage.getItem("practiceLogs") || "[]");
        logs.push(logEntry);
        localStorage.setItem("practiceLogs", JSON.stringify(logs));
        renderPracticeHistory();
    } catch (e) {
        console.error("Error saving log to localStorage:", e);
        alert("Could not save practice log. LocalStorage might be full or disabled.");
    }
}

function renderPracticeHistory() {
    if (!historyList) {
        console.error("History list element not found.");
        return;
    }
    historyList.innerHTML = "";
    let logs = [];
    try {
        logs = JSON.parse(localStorage.getItem("practiceLogs") || "[]");
    } catch (e) {
        console.error("Error parsing practiceLogs from localStorage:", e);
        // Optionally, clear corrupted localStorage item:
        // localStorage.removeItem("practiceLogs"); 
        historyList.innerHTML = "<li>Error loading practice history.</li>";
        return;
    }

    if (!Array.isArray(logs)) { // Ensure logs is an array
        logs = [];
        localStorage.setItem("practiceLogs", JSON.stringify(logs)); // Reset if not an array
    }

    logs.slice().reverse().forEach((log) => { 
        const item = document.createElement("li");
        
        let detailsArray = [];
        if (log.time && log.time !== "N/A") detailsArray.push(`<span class="log-label">Time:</span> ${log.time}`);
        if (log.tempo && log.tempo !== "N/A") detailsArray.push(`<span class="log-label">Tempo:</span> ${log.tempo}`);
        if (log.clickPattern && log.clickPattern.trim() !== "") detailsArray.push(`<span class="log-label">Click Pattern:</span> ${log.clickPattern}`);
        if (log.bpm && log.bpm.trim() !== "") detailsArray.push(`<span class="log-label">BPM:</span> ${log.bpm}`);
        if (log.rhythmPattern && log.rhythmPattern !== "N/A") detailsArray.push(`<span class="log-label">Rhythm Pattern:</span> ${log.rhythmPattern}`);
        if (log.subdivision && log.subdivision !== "N/A") detailsArray.push(`<span class="log-label">Subdivision:</span> ${log.subdivision}`);
        
        let detailsString = detailsArray.join(' / ');

        if (log.notes && log.notes.trim() !== "" && log.notes !== "N/A") { 
            detailsString += (detailsString ? "<br>" : "") + `<em><span class='log-label'>Notes:</span> ${log.notes}</em>`;
        }
        
        if (detailsString === "" && (!log.notes || log.notes.trim() === "" || log.notes === "N/A")) {
             detailsString = "<em>No specific parameters logged.</em>";
        }

        // CORRECTED line for item.innerHTML:
        item.innerHTML = `<strong>${log.date}</strong>: ${log.exercise}<br><em>${detailsString}</em>`;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-log-btn";
        deleteBtn.innerHTML = "&times;"; 
        deleteBtn.title = "Delete log";
        // Ensure log.id exists (it should with the new saveLogEntry)
        deleteBtn.onclick = () => log.id ? deleteLogEntry(log.id) : console.error("Log item missing ID for deletion."); 
        item.appendChild(deleteBtn);
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
    if (!historyList) {
        console.error("History list element not found for printing.");
        return;
    }

    const historyItemsHtml = Array.from(historyList.querySelectorAll("li"))
        .map(li => {
            const clonedLi = li.cloneNode(true);
            const deleteButton = clonedLi.querySelector('.delete-log-btn');
            if (deleteButton) {
                deleteButton.remove();
            }
            return clonedLi.outerHTML;
        })
        .join('');

    const printWindow = window.open('', '_blank', 'height=600,width=800,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes');

    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        alert("Could not open print window. Please check if your browser is blocking popups for this page and try again.");
        return;
    }

    printWindow.document.write('<html><head><title>Practice History</title>');
    printWindow.document.write('<style>' +
        'body { font-family: Arial, sans-serif; margin: 20px; color: #333; }' +
        'h1 { text-align: center; color: #007bff; margin-bottom: 20px; }' +
        'ul { list-style-type: none; padding: 0; }' +
        'li { padding: 10px; border-bottom: 1px solid #eee; page-break-inside: avoid; margin-bottom: 5px; }' +
        'strong { color: #0056b3; }' +
        'em { color: #444; font-size: 0.95em; }' +
        '.log-label { font-weight: bold; font-style: italic; }' +
        '</style>');
    printWindow.document.write('</head><body><h1>Practice History</h1><ul>');
    printWindow.document.write(historyItemsHtml);
    printWindow.document.write('</ul></body></html>');
    printWindow.document.close(); // Ensure document writing is complete

    // Store the printWindow reference in a way that setTimeout can access it,
    // even if this function's direct scope is gone.
    // However, closures should handle this. Let's try keeping it simple first.

    printWindow.focus(); // Focus the new window

    // Use a flag to manage closing, to avoid issues with some browsers
    let printCompleted = false;

    // For Chrome and some other browsers, printing is asynchronous.
    // We can listen for afterprint event.
    printWindow.onafterprint = function() {
        console.log("Print dialog closed or print job sent.");
        printCompleted = true;
        if (printWindow && !printWindow.closed) {
            printWindow.close();
        }
    };

    setTimeout(() => {
        try {
            if (printWindow && !printWindow.closed) {
                const success = printWindow.print();
                if (success === undefined || success) { // `print()` might return undefined or true
                    console.log("Print dialog initiated.");
                    // For browsers that don't support onafterprint reliably (like older Firefox)
                    // or if print is cancelled, we might still want to close.
                    setTimeout(() => {
                        if (!printCompleted && printWindow && !printWindow.closed) {
                            console.log("Closing print window after fallback timeout.");
                            printWindow.close();
                        }
                    }, 3000); // Fallback close after 3 seconds if onafterprint didn't fire
                } else {
                     console.warn("Print dialog might have been blocked or failed to open.");
                     if (printWindow && !printWindow.closed) printWindow.close(); // Close if it failed to print
                }
            }
        } catch (e) {
            console.error("Error triggering print dialog:", e);
            if (printWindow && !printWindow.closed) {
                printWindow.close(); // Close if there was an error
            }
        }
    }, 250); // Delay printing to allow content to render
}
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

if (playScaleVisualizerBtn) {
    playScaleVisualizerBtn.addEventListener("click", async () => { // Made it async
         pianoKeys.forEach(key => key.classList.remove("highlighted")); 
        console.log("Play Scale button clicked. Cleared previous highlights."); // Optional log

        const selectedRoot = visualizerRootNoteSelect.value;
        const selectedScaleFormulaKey = visualizerScaleTypeSelect.value;
        const selectedScaleTypeObject = DATA.VISUALIZER_SCALE_TYPES.find(s => s.value === selectedScaleFormulaKey);

        const scaleNotesWithOctave = generateScale(selectedRoot, selectedScaleFormulaKey);

            scaleNotesWithOctave.forEach(noteNameWithOctave => { // e.g., "C#3", "Db4"
                let noteNameToUseForQuery = noteNameWithOctave.slice(0, -1); // Extracts "C#", "Db"
                const octaveToUseForQuery = noteNameWithOctave.slice(-1);    // Extracts "3", "4"

                // Convert flat note names to their sharp equivalents for matching data-note attributes
                if (DATA.FLAT_TO_SHARP_KEY_MAP[noteNameToUseForQuery]) {
                    noteNameToUseForQuery = DATA.FLAT_TO_SHARP_KEY_MAP[noteNameToUseForQuery]; // e.g., "Db" becomes "C#"
                }
                // At this point, noteNameToUseForQuery should be like "C", "C#", "D", etc. (no spans)
                
                const finalDataNoteValue = `${noteNameToUseForQuery}${octaveToUseForQuery}`; // CLEAN: e.g., "C#3"

                // Declare keyToHighlight using querySelector
                const keyToHighlight = document.querySelector(`[data-note="${finalDataNoteValue}"]`);
                
                if (keyToHighlight) {
                    keyToHighlight.classList.add("highlighted");
                } else {
                    // Cleaned up console warning, uses the original note and the value tried
                    console.warn(`Piano key not found for original note: ${noteNameWithOctave} (tried data-note="${finalDataNoteValue}")`);
                }
            });
        // --- Tone.js Audio Playback Part ---
        if (!scaleNotesWithOctave || scaleNotesWithOctave.length === 0) {
            console.log("No notes generated, cannot play.");
            return; 
        }

        if (Tone.context.state !== 'running') {
            try {
                await Tone.start(); 
                console.log("AudioContext started by Tone.start()!");
            } catch (e) {
                console.error("Error starting AudioContext with Tone.start():", e);
                alert("Could not start audio. Please click anywhere on the page once, then try playing the scale again.");
                return;
            }
        }

        if (currentScaleSequence) { 
            currentScaleSequence.stop(0);
            currentScaleSequence.dispose();
            console.log("Previous sequence stopped and disposed.");
        }

        currentScaleSequence = new Tone.Sequence((time, note) => {
            synth.triggerAttackRelease(note, "8n", time); 
        }, scaleNotesWithOctave, "4n"); 

        currentScaleSequence.loop = false; 
        currentScaleSequence.start(0); 

        if (Tone.Transport.state !== "started") {
            Tone.Transport.start("+0.1"); 
            console.log("Tone.Transport started for sequence.");
        } else {
            Tone.Transport.stop(); 
            Tone.Transport.start("+0.1"); 
            console.log("Tone.Transport restarted for new sequence.");
        }
    });
} else {
    console.error("Button variable 'playScaleVisualizerBtn' (or its element) not found.");
}

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

 // REPLACE the existing "Initial Load Logic" block (the if/else) with this:
console.log("DIAGNOSTIC: Starting initial load logic. MATRIX_DISPLAYABLE_KEYS count:", DATA.MATRIX_DISPLAYABLE_KEYS.length);
        if (DATA.MATRIX_DISPLAYABLE_KEYS.length > 0 &&
            visualizerRootNoteSelect && visualizerRootNoteSelect.options.length > 0 &&
            visualizerScaleTypeSelect && visualizerScaleTypeSelect.options.length > 0
        ) {

            const initialKeyToDisplay = DATA.MATRIX_DISPLAYABLE_KEYS[0];
            const initialRoot = initialKeyToDisplay.split(" ")[0];
            const initialQualityDisplay = initialKeyToDisplay.substring(initialRoot.length + 1).trim();

            const initialScaleObj = DATA.VISUALIZER_SCALE_TYPES.find(s => s.display === initialQualityDisplay || s.display.startsWith(initialQualityDisplay));

            // Set default dropdown values for the visualizer
            if (visualizerRootNoteSelect.options.length > 0) {
                 visualizerRootNoteSelect.value = DATA.VISUALIZER_ROOT_NOTES.includes(initialRoot) ? initialRoot : visualizerRootNoteSelect.options[0].value;
            }
            if (visualizerScaleTypeSelect.options.length > 0) {
                visualizerScaleTypeSelect.value = initialScaleObj ? initialScaleObj.value : visualizerScaleTypeSelect.options[0].value;
            }

            // Update the matrix with the initial key by programmatically clicking the button
            if (updateMatrixExercisesBtn) {
                console.log("DIAGNOSTIC: Programmatically triggering 'Update Matrix' for initial load.");
                updateMatrixExercisesBtn.click();
            } else {
                console.error("DIAGNOSTIC: updateMatrixExercisesBtn not found for initial matrix render");
            }

            // Manually perform ONLY the visual update for the piano for the initial scale
            // DO NOT programmatically click playScaleVisualizerBtn here to avoid auto-play
            // AND to avoid the SyntaxError if generateScale was still outputting spans (which it isn't now).
            // NEW REPLACEMENT for initial piano display:
            if (scaleNameDisplay) {
                scaleNameDisplay.textContent = "Select root & scale type to visualize"; 
            }
            pianoKeys.forEach(key => key.classList.remove("highlighted")); // Ensure piano is clear
            console.log("INITIALIZE: Initial matrix loaded. Piano visualizer is blank, awaiting user interaction.");

        } else {
            if (tableContainer) tableContainer.innerHTML = "<p>Error: Cannot perform initial render. Key data or dropdowns missing.</p>";
            console.error("Initialization Error during initial load logic. MATRIX_DISPLAYABLE_KEYS empty or visualizer dropdowns not ready.");
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
} else {
    console.error("manualLogBtn not found for listener attachment during initialize.");
}
    if (tableContainer) {
        tableContainer.addEventListener("click", (e) => {
            const t = e.target;

            if (t.classList.contains("btn-outline") && t.textContent === "Log" && t.closest("tr")) {
                const row = t.closest("tr");
                if (row && row.cells.length > 7 && 
                    row.cells[0].querySelector(".exercise-key-name") &&
                    row.cells[1].querySelector("select") &&
                    row.cells[2].querySelector("input") &&
                    row.cells[3].querySelector("input") &&
                    row.cells[4].querySelector("select") &&
                    row.cells[5].querySelector("select") &&
                    row.cells[6].querySelector(".time-hours") &&
                    row.cells[6].querySelector(".time-minutes")) { 
                    
                    const keyNameEl = row.cells[0].querySelector(".exercise-key-name");
                    const templateNameEl = row.cells[0].querySelector(".exercise-template-name");
                    const parenNameEl = row.cells[0].querySelector(".exercise-parenthetical");
                    
                    let exFullName = `${keyNameEl ? keyNameEl.textContent : ""} ${templateNameEl ? templateNameEl.textContent : ""} ${parenNameEl ? parenNameEl.textContent : ""}`.trim().replace(/\s\s+/g, " ");

                    const detailsToSave = {
                        tempo: row.cells[1].querySelector("select").value,
                        clickPattern: row.cells[2].querySelector("input").value,
                        bpm: row.cells[3].querySelector("input").value,
                        rhythmPattern: row.cells[4].querySelector("select").value,
                        subdivision: row.cells[5].querySelector("select").value,
                        time: (row.cells[6].querySelector(".time-hours").value === "8+" ? "8+ hrs" : `${row.cells[6].querySelector(".time-hours").value}h`) +
                              ` ${row.cells[6].querySelector(".time-minutes").value.padStart(2, '0')}m`,
                        notes: "" 
                    };
                    
                    saveLogEntry(exFullName, new Date().toISOString().split("T")[0], detailsToSave);
                    t.textContent = "Logged!";
                    setTimeout(() => (t.textContent = "Log"), 2000);
                } else {
                    console.error("Log button: Could not find all expected cells/elements in the row to log data.");
                }
            } 

            if (t.classList.contains("exercise-name-cell") || t.closest(".exercise-name-cell")) {
                const currentCell = t.closest(".exercise-name-cell"); 
                if (currentCell) {
                    const kn = currentCell.querySelector(".exercise-key-name")?.textContent || "";
                    const tn = currentCell.querySelector(".exercise-template-name")?.textContent || "";
                    const pn = currentCell.querySelector(".exercise-parenthetical")?.textContent || "";
                    if (manualExerciseInput) {
                        manualExerciseInput.value = `${kn} ${tn} ${pn}`.trim().replace(/\s\s+/g, " ");
                    }
                    if (manualDateInput) {
                        manualDateInput.valueAsDate = new Date();
                    }
                }
            } 
        }); 
    } else {
        console.error("tableContainer element not found during initialization for event listener attachment.");
    }
    console.log("Enharmonic Highlighting Fix Initialized.");
  }
  initialize();
});
