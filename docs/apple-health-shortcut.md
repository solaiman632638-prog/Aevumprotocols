# Building the "Aevum Heart" Shortcut

Members get heart rate from Apple Health through one shared iPhone Shortcut.
Build it once on your iPhone, share its iCloud link, and put the link in
`healthShortcutUrl` in `src/lib/site.ts`.

The Shortcut never contains anyone's key. The Today page's **Link my iPhone**
button runs it with the member's key as input, and it saves that key to a
file on their phone.

## Build it

Open **Shortcuts**, tap **+**, and name it exactly **Aevum Heart**. The
Today page runs it by that name.

1. **Receive input.** Tap the input bar at the top. Set it to receive **Text**,
   and if there is no input, **Continue**.
2. **If** → *Shortcut Input* → **has any value**
   - Inside the If: **Save File**. Save *Shortcut Input*, turn **Ask Where to
     Save** off, set the subpath to `Aevum/key.txt`, and turn **Overwrite If
     File Exists** on.
   - **End If**
3. **Get File** from the Shortcuts folder, path `Aevum/key.txt`, with **Error
   If Not Found** on.
4. **Get Text from Input** (input: *File*). Rename the result **Key**.
5. **Find Health Samples** where *Type* is **Resting Heart Rate** and *Start
   Date* is in the last **2 days**. Sort by **Start Date**, **Latest First**,
   limit **1**.
6. **Get Details of Health Samples** → **Value**. Rename the result **RHR**.
7. Repeat steps 5–6 with **Heart Rate Variability** (name the result **HRV**)
   and **Respiratory Rate** (name the result **Resp**).
8. **Get Contents of URL**: `https://www.aevumperformance.ca/api/health/readings`
   - Method **POST**, Request Body **JSON**, with four **Text** fields:
     `key` = Key, `rhr` = RHR, `hrv` = HRV, `resp` = Resp.
9. **Get Dictionary Value** for `message` in *Contents of URL*.
10. **Show Notification** with *Dictionary Value*.

Run it once from the editor. It asks for Health access; allow all three types.
Without a key it stops at step 3. That is expected until you link it from the
Today page.

## Share it

In the Shortcuts list, long-press **Aevum Heart** → **Share** → **Copy iCloud
Link**. Paste that link into `healthShortcutUrl` in `src/lib/site.ts`, then push.
