// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
  /**
   * The unique ID of the track call itself.
   */
  _id?: string
  /**
   * The anonymous ID of the user.
   */
  anonymous_id?: string
  /**
   * The User ID.
   */
  user_id?: string
  /**
   * The IP address of the client. Non-user-related context fields sent with each track call.
   */
  context_ip?: string
  /**
   * The Logging library name. Non-user-related context fields sent with each track call.
   */
  context_library_name?: string
  /**
   * The Logging library version. Non-user-related context fields sent with each track call.
   */
  context_library_version?: string
  /**
   * The path of the page on which the event was logged.
   */
  context_page_path?: string
  /**
   * The title of the page on which the event was logged.
   */
  context_page_title?: string
  /**
   * The full url of the page on which the event was logged.
   */
  context_page_url?: string
  /**
   * The browsers locale used when the event was logged.
   */
  context_locale?: string
  /**
   * The browsers user-agent string.
   */
  context_user_agent?: string
  /**
   * The slug of the event name, so you can join the tracks table.
   */
  event?: string
  /**
   * The event name.
   */
  name?: string
  /**
   * When Segment received the track call.
   */
  received_at?: string | number
  /**
   * When a user triggered the track call. This timestamp can also be affected by device clock skew
   */
  sent_at?: string | number
  /**
   * The UTC-converted timestamp which is set by the Segment library
   */
  timestamp?: string | number
  /**
   * JSON representation of the properties for the event.
   */
  properties?: {
    [k: string]: unknown
  }
  /**
   * JSON representation of the context
   */
  context?: {
    [k: string]: unknown
  }
}
