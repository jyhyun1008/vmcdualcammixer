## VMC Dual Cam Mixer

**VMC Dual Cam Mixer** is a project designed to mix signals from two cameras using the VMC (Virtual Motion Capture) protocol. This tool is particularly useful for correcting specific motion capture scenarios that are difficult to capture accurately with a single camera, such as extending an arm forward or lifting a leg while looking sideways.

<img width="971" alt="image" src="https://github.com/user-attachments/assets/59b3999b-c182-4667-a3ec-df437c61240e">

### Demo Videos

- [Demo 1 (August 28, 2024, KST)](https://www.youtube.com/watch?v=nLQhRoKg1lo)
- [Demo 2 (August 29, 2024, KST)](https://www.youtube.com/watch?v=qQcTNW8PaQg)
- [Demo 3 (August 30, 2024, KST)](https://www.youtube.com/watch?v=v5PnMnwvdMQ)

### What Can It Do?

The main goal of the VMC Dual Cam Mixer is to allow for the correction of motions that are hard to capture properly with just one camera by using two separate motion capture programs. For instance, if one camera struggles to capture a specific movement, the other camera can fill in the gaps, resulting in a more accurate overall motion.

- The character in the center follows the movements of the **left-side character**:
  
  ![Left character movement](https://for.stella.place/D1/b4b8fda3-ce52-4434-8972-6fd7b1886839.webp)

- The character in the center follows the movements of the **right-side character**:

  ![Right character movement](https://for.stella.place/D1/22dda791-8eda-4bdf-ae97-3cc9749666ce.webp)

**Key Difference**: Unlike other similar software, you don't need to specify which signal each bone receives from which port; instead, the VMC Dual Cam Mixer simply merges all the signals together.

### Important Notes

- **Current Status**: The project is still in an early stage and may not be fully functional yet. The creator is working on improving it.
- The software assumes you have one program running locally (e.g., Webcam Motion Capture) and another on a remote device (e.g., an iPhone using TDPT).
- Facial expressions and finger movements are received from the **local software**.
- Compatibility and synchronization between the two programs may vary, requiring extensive testing.
- The setup assumes both cameras are capable of capturing the entire body. If not, the results may be distorted. Ensure you're capturing the full body from a distance in a spacious area.
- **Recommended Field of View**: 45 - 70 degrees.
- This is a Node.js project, so you will need Node.js installed on your system.

### Recent Updates

- **August 29, 2024 (KST)**: Improved smoother motion capture capabilities.
- **August 30, 2024 (KST)**: Improved the efficiency of the code. + Fixed an issue where the Root Bone was not being recognized.