import pandas as pd
from tkinter import *
from tkinter import ttk, messagebox, filedialog
from tkcalendar import Calendar
import os

# Check if file exists and load events
if os.path.exists('events.csv'):
    events = pd.read_csv('events.csv')
else:
    events = pd.DataFrame(columns=['Date', 'Time', 'Event', 'Description'])

# Function to add events
def add_event():
    global events
    date = cal.selection_get()
    time = time_entry.get().strip()
    event_name = event_entry.get().strip()
    description = desc_entry.get().strip()
    recurrence = repeat_var.get()

    # Validation
    if not time or not event_name:
        messagebox.showwarning("Missing Information", "Please fill in Time and Event Name.")
        return

    # Add main event
    events = events.append({'Date': date, 'Time': time, 'Event': event_name, 'Description': description}, ignore_index=True)

    # Handle recurrence
    add_recurrence(date, time, event_name, description, recurrence)

    # Save to CSV
    events.to_csv('events.csv', index=False)

    # Clear entries and reset UI
    time_entry.delete(0, END)
    event_entry.delete(0, END)
    desc_entry.delete(0, END)
    repeat_var.set("None")
    display_events()
    


# Helper to handle recurrence
def add_recurrence(start_date, time, event_name, description, recurrence):
    global events
    new_events = []
    if recurrence == "Daily":
        for i in range(1, 8):  # Repeat for 7 days
            repeat_date = (pd.to_datetime(start_date) + pd.Timedelta(days=i)).date()
            new_events.append({'Date': repeat_date, 'Time': time, 'Event': event_name, 'Description': description})
    elif recurrence == "Weekly":
        for i in range(1, 5):  # Repeat for 4 weeks
            repeat_date = (pd.to_datetime(start_date) + pd.Timedelta(weeks=i)).date()
            new_events.append({'Date': repeat_date, 'Time': time, 'Event': event_name, 'Description': description})
    elif recurrence == "Monthly":
        for i in range(1, 4):  # Repeat for 3 months
            repeat_date = (pd.to_datetime(start_date) + pd.DateOffset(months=i)).date()
            new_events.append({'Date': repeat_date, 'Time': time, 'Event': event_name, 'Description': description})

    # Append new events to the DataFrame
    events = pd.concat([events, pd.DataFrame(new_events)], ignore_index=True).drop_duplicates(subset=['Date', 'Event'], keep='last')
    

def add_group_of_events():
    def process_group_events():
        print("Processing group events...")  # Debugging
        # Get input data
        topics_with_priority = topic_entry.get("1.0", END).strip().split('\n')
        topics = []
        priorities = []
        for line in topics_with_priority:
            if ":" in line:
                try:
                    topic, priority = line.split(":", 1)
                    topics.append(topic.strip())
                    priorities.append(int(priority.strip()))
                except ValueError:
                    messagebox.showwarning("Invalid Input", f"Invalid priority format: {line}")
                    return
            else:
                topics.append(line.strip())
                priorities.append(0)  # Default priority
        print(f"Topics: {topics}")  # Debugging
        print(f"Priorities: {priorities}")  # Debugging

        start_date = group_start_cal.selection_get()
        end_date = group_end_cal.selection_get()
        selected_days = [day for day, var in day_vars.items() if var.get()]
        exclude_dates = exclude_entry.get("1.0", END).strip().split(',')
        exclude_dates = [pd.to_datetime(d).date() for d in exclude_dates if d.strip()]
        default_time = default_time_entry.get().strip()

        print(f"Start Date: {start_date}, End Date: {end_date}")  # Debugging
        print(f"Selected Days: {selected_days}")  # Debugging
        print(f"Exclude Dates: {exclude_dates}")  # Debugging
        print(f"Default Time: {default_time}")  # Debugging

        if not topics or not selected_days or not default_time:
            messagebox.showwarning("Missing Information", "Please fill in all required fields.")
            return

        # Generate valid dates
        valid_dates = generate_valid_dates(start_date, end_date, selected_days, exclude_dates)

        print(f"Valid Dates: {valid_dates}")  # Debugging

        if len(valid_dates) < len(topics):
            messagebox.showwarning("Insufficient Dates", "Not enough valid dates for all topics.")
            return

        # Sort topics by priority
        sorted_topics = [topic for _, topic in sorted(zip(priorities, topics), reverse=True)]
        print(f"Sorted Topics: {sorted_topics}")  # Debugging


        # Evenly distribute topics over valid dates
        interval = max(1, len(valid_dates) // len(sorted_topics))  # Ensure at least one event per date
        new_events = []

        for i, topic in enumerate(sorted_topics):
            date_index = i * interval
            if date_index < len(valid_dates):
                date = valid_dates[date_index]
                time_for_event = custom_times.get(topic, default_time)
                new_events.append({'Date': date, 'Time': time_for_event, 'Event': topic, 'Description': 'Grouped Event'})

        # Debugging: Check distributed events
        print(f"Distributed Events: {new_events}")

        # Debugging: Check the new events being added
        print(f"New Events: {new_events}")

        # Add new events to the DataFrame
        global events
        events = pd.concat([events, pd.DataFrame(new_events)], ignore_index=True).drop_duplicates(subset=['Date', 'Event'], keep='last')
        print(events)  # Debugging: Check if events are updated in the DataFrame

        # Feedback and close modal
        messagebox.showinfo("Success", "Grouped events added successfully!")
        messagebox.showinfo("Success", f"{len(new_events)} grouped events added successfully!")

        display_events()
        group_window.destroy()

    def add_custom_time():
        topic = custom_topic_entry.get().strip()
        time = custom_time_entry.get().strip()
        if topic and time:
            custom_times[topic] = time
            custom_time_display.insert(END, f"{topic}: {time}\n")
            custom_topic_entry.delete(0, END)
            custom_time_entry.delete(0, END)
        else:
            messagebox.showwarning("Missing Information", "Please fill in both Topic and Time.")

    # Modal window
    group_window = Toplevel(root)
    group_window.title("Add Grouped Events")
    group_window.geometry("600x700")

    Label(group_window, text="Topics (one per line, optional priority: 'Topic: Priority'):").pack()
    topic_entry = Text(group_window, height=5)
    topic_entry.pack(pady=5)

    Label(group_window, text="Start Date:").pack()
    group_start_cal = Calendar(group_window)
    group_start_cal.pack()

    Label(group_window, text="End Date:").pack()
    group_end_cal = Calendar(group_window)
    group_end_cal.pack()

    Label(group_window, text="Select Days of the Week:").pack()
    days_frame = Frame(group_window)
    days_frame.pack()
    day_vars = {day: BooleanVar() for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
    for day, var in day_vars.items():
        Checkbutton(days_frame, text=day, variable=var).pack(side=LEFT)

    Label(group_window, text="Exclude Specific Dates (comma-separated):").pack()
    exclude_entry = Text(group_window, height=3)
    exclude_entry.pack(pady=5)

    Label(group_window, text="Default Time (e.g., '10:00 AM')").pack()
    default_time_entry = Entry(group_window)
    default_time_entry.pack(pady=5)

    Label(group_window, text="Custom Times for Specific Topics:").pack()
    custom_time_frame = Frame(group_window)
    custom_time_frame.pack()

    custom_topic_entry = Entry(custom_time_frame, width=20)
    custom_topic_entry.grid(row=0, column=0, padx=5, pady=5)
    custom_time_entry = Entry(custom_time_frame, width=10)
    custom_time_entry.grid(row=0, column=1, padx=5, pady=5)
    Button(custom_time_frame, text="Add", command=add_custom_time).grid(row=0, column=2, padx=5, pady=5)

    custom_time_display = Text(group_window, height=5)
    custom_time_display.pack(pady=5)

    custom_times = {}  # To store custom times for specific topics

    Button(group_window, text="Add Group Events", command=process_group_events).pack(pady=10)
    


# Helper to generate valid dates
def generate_valid_dates(start_date, end_date, selected_days, exclude_dates):
    all_dates = pd.date_range(start=start_date, end=end_date).to_list()
    valid_dates = [
        date.date()
        for date in all_dates
        if date.strftime('%A') in selected_days and date.date() not in exclude_dates
    ]
    return valid_dates

def update_calendar_tags():
    # Clear all previous tags
    cal.calevent_remove('all')

    # Iterate over events and tag their dates
    for _, row in events.iterrows():
        event_date = row['Date']
        try:
            # Convert the date to the calendar's format
            event_date = pd.to_datetime(event_date).date()
            cal.calevent_create(event_date, row['Event'], 'event')  # Tag the date
        except Exception as e:
            print(f"Error tagging date {event_date}: {e}")  # Debugging

def reset_view():
    for row in tree.get_children():
        tree.delete(row)
    for _, event in events.iterrows():
        tree.insert('', 'end', values=(event['Date'], event['Time'], event['Event'], event['Description']))


def distribute_evenly(topics, valid_dates):
    interval = max(1, len(valid_dates) // len(topics))  # Avoid division by zero
    distributed_dates = []
    for i, topic in enumerate(topics):
        if i * interval < len(valid_dates):
            distributed_dates.append((valid_dates[i * interval], topic))
    return distributed_dates



def display_events():
    global events
    for row in tree.get_children():
        tree.delete(row)

    selected_date = cal.selection_get()
    print(f"Displaying events for: {selected_date}")  # Debugging

    # Ensure the Date column is in datetime.date format
    events['Date'] = pd.to_datetime(events['Date']).dt.date

    # Filter events for the selected date
    day_events = events[events['Date'] == selected_date]
    print(day_events)  # Debugging: Check filtered events

    for _, event in day_events.iterrows():
        tree.insert('', 'end', values=(event['Date'], event['Time'], event['Event'], event['Description']))




# Delete events
def delete_event():
    global events
    selected_date = cal.selection_get()
    if messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete all events for {selected_date}?"):
        events = events[events['Date'] != str(selected_date)]  # Remove events for selected date
        events.to_csv('events.csv', index=False)  # Save updated events
        display_events()

# Export events to CSV
def export_events():
    file_path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV files", "*.csv")])
    if file_path:
        events.to_csv('events.csv', index=False)
        print("Events saved to CSV.")  # Debugging

        messagebox.showinfo("Export Successful", "Events exported successfully!")
def update_calendar_tags():
    # Clear all previous tags
    cal.calevent_remove('all')

    # Iterate over events and tag their dates
    for _, row in events.iterrows():
        event_date = row['Date']
        try:
            # Convert the date to the calendar's format
            event_date = pd.to_datetime(event_date).date()
            cal.calevent_create(event_date, row['Event'], 'event')  # Tag the date
        except Exception as e:
            print(f"Error tagging date {event_date}: {e}")  # Debugging

# Import events from CSV
def import_events():
    global events
    file_path = filedialog.askopenfilename(filetypes=[("CSV files", "*.csv")])
    if file_path:
        new_events = pd.read_csv(file_path)
        events = pd.concat([events, new_events]).drop_duplicates().reset_index(drop=True)
        events.to_csv('events.csv', index=False)
        display_events()
        messagebox.showinfo("Import Successful", "Events imported successfully!")

# Standardize the Date column format before saving
events['Date'] = pd.to_datetime(events['Date']).dt.date
events.to_csv('events.csv', index=False)

# Main window
root = Tk()
root.title("Event Calendar")
root.geometry("600x700")

# Frames
calendar_frame = Frame(root)
calendar_frame.pack(pady=10)

input_frame = Frame(root)
input_frame.pack(pady=10)

action_frame = Frame(root)
action_frame.pack(pady=10)

event_list_frame = Frame(root)
event_list_frame.pack(pady=10)


# Calendar
cal = Calendar(calendar_frame, selectmode='day', year=2024, month=12, day=3)
cal.pack()
cal.bind("<<CalendarSelected>>", lambda e: display_events())
cal.tag_config('event', background='lightblue', foreground='black')


# Input fields
Label(input_frame, text="Time (HH:MM):").grid(row=0, column=0, padx=5, pady=5)
time_entry = Entry(input_frame)
time_entry.grid(row=0, column=1, padx=5, pady=5)

Label(input_frame, text="Event Name:").grid(row=1, column=0, padx=5, pady=5)
event_entry = Entry(input_frame)
event_entry.grid(row=1, column=1, padx=5, pady=5)

Label(input_frame, text="Description:").grid(row=2, column=0, padx=5, pady=5)
desc_entry = Entry(input_frame)
desc_entry.grid(row=2, column=1, padx=5, pady=5)

Label(input_frame, text="Repeat:").grid(row=3, column=0, padx=5, pady=5)
repeat_var = StringVar(value="None")
repeat_menu = OptionMenu(input_frame, repeat_var, "None", "Daily", "Weekly", "Monthly")
repeat_menu.grid(row=3, column=1, padx=5, pady=5)

# Action buttons
Button(action_frame, text="Add Event", command=add_event).grid(row=0, column=0, padx=5, pady=5)
Button(action_frame, text="Add Grouped Events", command=add_group_of_events).grid(row=1, column=0, padx=5, pady=5)
Button(action_frame, text="Show All Events", command=reset_view).grid(row=1, column=3, padx=5, pady=5)
Button(action_frame, text="Delete Events", command=delete_event).grid(row=0, column=1, padx=5, pady=5)
Button(action_frame, text="Export Events", command=export_events).grid(row=0, column=2, padx=5, pady=5)
Button(action_frame, text="Import Events", command=import_events).grid(row=0, column=3, padx=5, pady=5)

# Event list
tree = ttk.Treeview(event_list_frame, columns=('Date', 'Time', 'Event', 'Description'), show='headings', height=10)
tree.heading('Date', text='Date')
tree.heading('Time', text='Time')
tree.heading('Event', text='Event')
tree.heading('Description', text='Description')
tree.pack()

# Run application
root.mainloop()
