/* Tutorial 2 lessons; lesson 6 is a beginner Sense HAT mood light. */
window.tutorialLessons = [
  {
    "title": "Make one decision with if",
    "concept": "A condition is a question with a True or False answer. if runs its indented lines only when the condition is True. End the if line with a colon (:), then indent its body by four spaces. Lines outside the block run either way.",
    "task": "Write an if statement that prints \"It's hot today!\" when temperature > 77. Leave print(\"Done\") outside the if. Run and check both 86 and 77.",
    "predict": "At exactly 77°F, is temperature > 77 True or False?",
    "starter": "temperature = int(input(\"Temperature in Fahrenheit: \"))\n# Add your if statement below.\nprint(\"Done\")\n",
    "hint": "Use if temperature > 77: followed by an indented print. Do not indent print(\"Done\").",
    "solution": "temperature = int(input(\"Temperature in Fahrenheit: \"))\nif temperature > 77:\n    print(\"It's hot today!\")\nprint(\"Done\")\n",
    "tests": [
      {
        "inputs": [
          "86"
        ],
        "output": [
          "It's hot today!",
          "Done"
        ],
        "label": "86°F · condition true"
      },
      {
        "inputs": [
          "77"
        ],
        "output": [
          "Done"
        ],
        "label": "77°F · condition false"
      }
    ],
    "question": [
      "Why does 77°F print only Done?",
      [
        "77 > 77 is False, so the indented line is skipped.",
        "Python does not accept 77.",
        "An if statement always runs."
      ],
      0,
      "The > symbol means strictly greater than. Done is outside the if, so it still prints."
    ]
  },
  {
    "title": "Choose between if and else",
    "concept": "else supplies the alternative when an if condition is False. Exactly one of these two blocks runs. Align else with if, and put a colon after else.",
    "task": "Print \"It's hot today!\" when temperature > 77; otherwise print \"It's not hot today.\" Use if and else. Run and check 86, 65, and the boundary value 77.",
    "predict": "Which branch (path through the code) should run at exactly 77°F?",
    "starter": "temperature = int(input(\"Temperature in Fahrenheit: \"))\n# Write if and else below.\n",
    "hint": "else: has no condition after it. Indent one print statement under each branch.",
    "solution": "temperature = int(input(\"Temperature in Fahrenheit: \"))\nif temperature > 77:\n    print(\"It's hot today!\")\nelse:\n    print(\"It's not hot today.\")\n",
    "tests": [
      {
        "inputs": [
          "86"
        ],
        "output": [
          "It's hot today!"
        ],
        "label": "86°F · hot"
      },
      {
        "inputs": [
          "65"
        ],
        "output": [
          "It's not hot today."
        ],
        "label": "65°F · not hot"
      },
      {
        "inputs": [
          "77"
        ],
        "output": [
          "It's not hot today."
        ],
        "label": "77°F · boundary"
      }
    ],
    "question": [
      "What does else do?",
      [
        "Runs after every if, even if it was True.",
        "Runs only when the matching if condition is False.",
        "Checks that the temperature is 0."
      ],
      1,
      "The if and else are alternatives; only one runs."
    ]
  },
  {
    "title": "Add a third choice with elif",
    "concept": "elif means \"else if\". Python checks a chain from top to bottom and runs only the first True branch. else handles all remaining values. Order matters: check the higher temperature first.",
    "task": "Print \"It's really hot!\" above 86°F, \"It's warm.\" above 68°F, and \"It's cold.\" otherwise. Use if, elif, and else. Check all three temperatures listed below.",
    "predict": "At 86°F, which comparison is False and which is True?",
    "starter": "temperature = int(input(\"Temperature in Fahrenheit: \"))\n# Add if, elif, and else in this order.\n",
    "hint": "Start with if temperature > 86:, then elif temperature > 68:, then else:.",
    "solution": "temperature = int(input(\"Temperature in Fahrenheit: \"))\nif temperature > 86:\n    print(\"It's really hot!\")\nelif temperature > 68:\n    print(\"It's warm.\")\nelse:\n    print(\"It's cold.\")\n",
    "tests": [
      {
        "inputs": [
          "90"
        ],
        "output": [
          "It's really hot!"
        ],
        "label": "90°F · first branch"
      },
      {
        "inputs": [
          "86"
        ],
        "output": [
          "It's warm."
        ],
        "label": "86°F · middle branch"
      },
      {
        "inputs": [
          "68"
        ],
        "output": [
          "It's cold."
        ],
        "label": "68°F · else branch"
      }
    ],
    "question": [
      "At 90°F, why does this chain print only It's really hot!?",
      [
        "The first True branch runs, and the rest of the chain is skipped.",
        "90 is not greater than 68.",
        "Every branch runs, but only one is displayed."
      ],
      0,
      "Even though 90 > 68 is also True, Python stops after the first matching branch."
    ]
  },
  {
    "title": "Use two independent if statements",
    "concept": "Separate if statements each make their own decision. Unlike an if/elif chain, more than one independent if block can run. Keep the second if aligned with the first.",
    "task": "Print \"Great job!\" if score > 80. In a separate if, print \"You passed!\" if score > 60. Keep print(\"Checked\") outside both blocks. Check 90, 70, and 60.",
    "predict": "How many messages will score 90 print, including Checked?",
    "starter": "score = int(input(\"Score: \"))\n# Write two independent if statements.\nprint(\"Checked\")\n",
    "hint": "Use if twice, not elif. At 90, both conditions are True.",
    "solution": "score = int(input(\"Score: \"))\nif score > 80:\n    print(\"Great job!\")\nif score > 60:\n    print(\"You passed!\")\nprint(\"Checked\")\n",
    "tests": [
      {
        "inputs": [
          "90"
        ],
        "output": [
          "Great job!",
          "You passed!",
          "Checked"
        ],
        "label": "90 · both conditions true"
      },
      {
        "inputs": [
          "70"
        ],
        "output": [
          "You passed!",
          "Checked"
        ],
        "label": "70 · second condition true"
      },
      {
        "inputs": [
          "60"
        ],
        "output": [
          "Checked"
        ],
        "label": "60 · neither condition true"
      }
    ],
    "question": [
      "If the second if became elif, what would score 90 print?",
      [
        "Great job!, You passed!, and Checked",
        "Only Checked",
        "Great job! and Checked"
      ],
      2,
      "An elif belongs to the first chain, so it is skipped when score > 80 is True."
    ]
  },
  {
    "title": "Put a decision inside a decision",
    "concept": "A nested if is an if inside another if. The inside condition is checked only when the outside condition is True. Use four spaces for the outer body and eight spaces for the inner body. An else belongs to the if at the same indentation.",
    "task": "For this fictional event, age must be at least 16. If age >= 16, check has_id: print \"You can enter.\" if True, or \"You need an ID.\" if False. Otherwise print \"You're too young.\" The provided line converts yes into True.",
    "predict": "For age 15 with an ID, will Python reach the inside if?",
    "starter": "age = int(input(\"Age: \"))\nhas_id = input(\"Do you have an ID? yes/no: \") == \"yes\"\n# Nest an ID check inside the age check.\n",
    "hint": "Put if has_id: inside if age >= 16:. The ID else is indented four spaces. The age else starts at the left margin.",
    "solution": "age = int(input(\"Age: \"))\nhas_id = input(\"Do you have an ID? yes/no: \") == \"yes\"\nif age >= 16:\n    if has_id:\n        print(\"You can enter.\")\n    else:\n        print(\"You need an ID.\")\nelse:\n    print(\"You're too young.\")\n",
    "tests": [
      {
        "inputs": [
          "16",
          "yes"
        ],
        "output": [
          "You can enter."
        ],
        "label": "16 + yes · enter"
      },
      {
        "inputs": [
          "16",
          "no"
        ],
        "output": [
          "You need an ID."
        ],
        "label": "16 + no · ID needed"
      },
      {
        "inputs": [
          "15",
          "yes"
        ],
        "output": [
          "You're too young."
        ],
        "label": "15 + yes · too young"
      }
    ],
    "question": [
      "Why does age 15 with an ID still print You're too young.?",
      [
        "Having an ID makes age change to 16.",
        "The outer age check is False, so the inner check is skipped.",
        "The inside if always runs first."
      ],
      1,
      "The outside condition controls whether Python reaches the nested condition."
    ]
  },
  {
    "title": "Create a Sense HAT mood light",
    "concept": "Turn your mood into a color! sense.clear(red, green, blue) fills all 64 LEDs. Each number ranges from 0 (off) to 255 (bright). Green is (0, 255, 0); blue is (0, 0, 255). Use == to compare your answer with \"happy\".",
    "task": "Ask for a mood using the provided input line. If mood == \"happy\", fill the LEDs green and print \"Green mood light\". Otherwise, fill them blue and print \"Blue mood light\". Run and check happy and tired (lowercase). Watch the mood-light preview below.",
    "predict": "If you enter tired, which color should appear? What about excited?",
    "starter": "from sense_hat import SenseHat\nsense = SenseHat()\nmood = input(\"Your mood (happy or tired): \")\n# Write your if/else below.\n",
    "hint": "Use if mood == \"happy\": then sense.clear(0, 255, 0) and print(\"Green mood light\"), both indented. Under else:, use sense.clear(0, 0, 255) and print(\"Blue mood light\").",
    "solution": "from sense_hat import SenseHat\nsense = SenseHat()\nmood = input(\"Your mood (happy or tired): \")\nif mood == \"happy\":\n    sense.clear(0, 255, 0)\n    print(\"Green mood light\")\nelse:\n    sense.clear(0, 0, 255)\n    print(\"Blue mood light\")\n",
    "tests": [
      {
        "inputs": [
          "happy"
        ],
        "output": [
          "Green mood light"
        ],
        "color": [
          0,
          255,
          0
        ],
        "label": "happy → green LEDs"
      },
      {
        "inputs": [
          "tired"
        ],
        "output": [
          "Blue mood light"
        ],
        "color": [
          0,
          0,
          255
        ],
        "label": "tired → blue LEDs"
      }
    ],
    "question": [
      "What happens if you type excited?",
      [
        "The LEDs turn green.",
        "The LEDs turn blue because excited is not happy.",
        "Both colors appear at the same time."
      ],
      1,
      "Only the exact text happy makes the condition True. Any other answer takes the blue else branch."
    ]
  }
];
